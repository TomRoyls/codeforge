import { describe, it, expect, beforeEach } from 'vitest'
import { RandomizedQueue } from '../../src/core/randomized-queue/index.js'

describe('RandomizedQueue', () => {
  describe('constructor', () => {
    it('should create an empty queue', () => {
      const q = new RandomizedQueue<number>()
      expect(q.size).toBe(0)
      expect(q.isEmpty).toBe(true)
    })

    it('should create a queue from an array', () => {
      const q = new RandomizedQueue([1, 2, 3])
      expect(q.size).toBe(3)
    })

    it('should create a queue from an empty array', () => {
      const q = new RandomizedQueue<number>([])
      expect(q.size).toBe(0)
      expect(q.isEmpty).toBe(true)
    })

    it('should create a queue with strings', () => {
      const q = new RandomizedQueue(['a', 'b', 'c'])
      expect(q.size).toBe(3)
      expect(q.contains('a')).toBe(true)
    })

    it('should create a queue with objects', () => {
      const obj = { x: 1 }
      const q = new RandomizedQueue([obj])
      expect(q.size).toBe(1)
      expect(q.contains(obj)).toBe(true)
    })

    it('should preserve order in toArray', () => {
      const q = new RandomizedQueue([1, 2, 3])
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('should create a queue with options', () => {
      const q = new RandomizedQueue<number>(undefined, { initialCapacity: 32 })
      expect(q.size).toBe(0)
    })
  })

  describe('enqueue', () => {
    let q: RandomizedQueue<number>
    beforeEach(() => { q = new RandomizedQueue<number>() })

    it('should add an element', () => {
      q.enqueue(1)
      expect(q.size).toBe(1)
      expect(q.isEmpty).toBe(false)
    })

    it('should add multiple elements', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.size).toBe(3)
    })

    it('should add elements at the back', () => {
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      expect(q.peek()).toBe(1)
      expect(q.peekBack()).toBe(3)
    })

    it('should handle adding zero', () => {
      q.enqueue(0)
      expect(q.contains(0)).toBe(true)
    })

    it('should handle adding negative numbers', () => {
      q.enqueue(-1)
      expect(q.contains(-1)).toBe(true)
    })

    it('should handle adding null', () => {
      const nq = new RandomizedQueue<null>()
      nq.enqueue(null)
      expect(nq.size).toBe(1)
    })

    it('should handle adding undefined', () => {
      const uq = new RandomizedQueue<undefined>()
      uq.enqueue(undefined)
      expect(uq.size).toBe(1)
    })

    it('should handle adding duplicate values', () => {
      q.enqueue(1)
      q.enqueue(1)
      q.enqueue(1)
      expect(q.size).toBe(3)
    })
  })

  describe('push (alias)', () => {
    it('should work as alias for enqueue', () => {
      const q = new RandomizedQueue<number>()
      q.push(1)
      q.push(2)
      expect(q.size).toBe(2)
      expect(q.peek()).toBe(1)
      expect(q.peekBack()).toBe(2)
    })

    it('should add elements in order', () => {
      const q = new RandomizedQueue<number>()
      q.push(10)
      q.push(20)
      q.push(30)
      expect(q.toArray()).toEqual([10, 20, 30])
    })
  })

  describe('dequeue', () => {
    it('should throw on empty queue', () => {
      const q = new RandomizedQueue<number>()
      expect(() => q.dequeue()).toThrow('Cannot dequeue from empty queue')
    })

    it('should return the only element', () => {
      const q = new RandomizedQueue([42])
      expect(q.dequeue()).toBe(42)
      expect(q.size).toBe(0)
    })

    it('should return an element from the queue', () => {
      const q = new RandomizedQueue([1, 2, 3, 4, 5])
      const val = q.dequeue()
      expect([1, 2, 3, 4, 5]).toContain(val)
      expect(q.size).toBe(4)
    })

    it('should remove exactly one element', () => {
      const q = new RandomizedQueue([1, 2, 3])
      q.dequeue()
      expect(q.size).toBe(2)
    })

    it('should drain all elements', () => {
      const q = new RandomizedQueue([1, 2, 3])
      const drained: number[] = []
      while (!q.isEmpty) {
        drained.push(q.dequeue())
      }
      expect(drained.sort()).toEqual([1, 2, 3])
      expect(q.size).toBe(0)
    })

    it('should throw after draining', () => {
      const q = new RandomizedQueue([1])
      q.dequeue()
      expect(() => q.dequeue()).toThrow()
    })

    it('should handle dequeue after enqueue', () => {
      const q = new RandomizedQueue<number>()
      q.enqueue(10)
      q.enqueue(20)
      const val = q.dequeue()
      expect([10, 20]).toContain(val)
      expect(q.size).toBe(1)
    })

    it('should have reasonable distribution over many calls', () => {
      const q = new RandomizedQueue([1, 2, 3, 4])
      const counts = new Map<number, number>()
      for (const v of [1, 2, 3, 4]) counts.set(v, 0)
      const trials = 1000
      for (let i = 0; i < trials; i++) {
        const fresh = new RandomizedQueue([1, 2, 3, 4])
        const val = fresh.dequeue()
        counts.set(val, counts.get(val)! + 1)
      }
      const expected = trials / 4
      for (const count of counts.values()) {
        expect(count).toBeGreaterThan(expected * 0.5)
      }
    })
  })

  describe('sample', () => {
    it('should throw on empty queue', () => {
      const q = new RandomizedQueue<number>()
      expect(() => q.sample()).toThrow('Cannot sample from empty queue')
    })

    it('should return the only element without removing', () => {
      const q = new RandomizedQueue([42])
      expect(q.sample()).toBe(42)
      expect(q.size).toBe(1)
    })

    it('should return an element from the queue', () => {
      const q = new RandomizedQueue([1, 2, 3, 4, 5])
      for (let i = 0; i < 50; i++) {
        const val = q.sample()
        expect([1, 2, 3, 4, 5]).toContain(val)
      }
      expect(q.size).toBe(5)
    })

    it('should not modify the queue', () => {
      const q = new RandomizedQueue([1, 2, 3])
      q.sample()
      q.sample()
      q.sample()
      expect(q.size).toBe(3)
    })

    it('should work with string elements', () => {
      const q = new RandomizedQueue(['a', 'b', 'c'])
      const val = q.sample()
      expect(['a', 'b', 'c']).toContain(val)
    })

    it('should have reasonable distribution', () => {
      const q = new RandomizedQueue([1, 2, 3, 4])
      const counts = new Map<number, number>()
      for (const v of [1, 2, 3, 4]) counts.set(v, 0)
      for (let i = 0; i < 10000; i++) {
        const val = q.sample()
        counts.set(val, counts.get(val)! + 1)
      }
      const expected = 10000 / 4
      for (const count of counts.values()) {
        expect(count).toBeGreaterThan(expected * 0.6)
        expect(count).toBeLessThan(expected * 1.4)
      }
    })
  })

  describe('peek', () => {
    it('should throw on empty queue', () => {
      const q = new RandomizedQueue<number>()
      expect(() => q.peek()).toThrow('Cannot peek from empty queue')
    })

    it('should return front element', () => {
      const q = new RandomizedQueue([1, 2, 3])
      expect(q.peek()).toBe(1)
    })

    it('should not remove the element', () => {
      const q = new RandomizedQueue([1, 2, 3])
      q.peek()
      expect(q.size).toBe(3)
    })

    it('should return the same value on repeated calls', () => {
      const q = new RandomizedQueue([10, 20])
      expect(q.peek()).toBe(10)
      expect(q.peek()).toBe(10)
      expect(q.peek()).toBe(10)
    })

    it('should return front after enqueue', () => {
      const q = new RandomizedQueue<number>()
      q.enqueue(5)
      q.enqueue(10)
      expect(q.peek()).toBe(5)
    })
  })

  describe('peekBack', () => {
    it('should throw on empty queue', () => {
      const q = new RandomizedQueue<number>()
      expect(() => q.peekBack()).toThrow('Cannot peekBack from empty queue')
    })

    it('should return back element', () => {
      const q = new RandomizedQueue([1, 2, 3])
      expect(q.peekBack()).toBe(3)
    })

    it('should not remove the element', () => {
      const q = new RandomizedQueue([1, 2, 3])
      q.peekBack()
      expect(q.size).toBe(3)
    })

    it('should return same value on repeated calls', () => {
      const q = new RandomizedQueue([10, 20])
      expect(q.peekBack()).toBe(20)
      expect(q.peekBack()).toBe(20)
    })

    it('should return the last enqueued element', () => {
      const q = new RandomizedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(99)
      expect(q.peekBack()).toBe(99)
    })
  })

  describe('size', () => {
    it('should return 0 for new queue', () => {
      expect(new RandomizedQueue().size).toBe(0)
    })

    it('should reflect additions', () => {
      const q = new RandomizedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.size).toBe(2)
    })

    it('should reflect constructor items', () => {
      const q = new RandomizedQueue([1, 2, 3])
      expect(q.size).toBe(3)
    })

    it('should reflect after dequeue', () => {
      const q = new RandomizedQueue([1, 2, 3])
      q.dequeue()
      expect(q.size).toBe(2)
    })

    it('should reflect after clear', () => {
      const q = new RandomizedQueue([1, 2])
      q.clear()
      expect(q.size).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new queue', () => {
      expect(new RandomizedQueue().isEmpty).toBe(true)
    })

    it('should return false after enqueue', () => {
      const q = new RandomizedQueue<number>()
      q.enqueue(1)
      expect(q.isEmpty).toBe(false)
    })

    it('should return true after removing all', () => {
      const q = new RandomizedQueue([1])
      q.dequeue()
      expect(q.isEmpty).toBe(true)
    })

    it('should return true after clear', () => {
      const q = new RandomizedQueue([1, 2, 3])
      q.clear()
      expect(q.isEmpty).toBe(true)
    })

    it('should return false with constructor items', () => {
      const q = new RandomizedQueue([1])
      expect(q.isEmpty).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all elements', () => {
      const q = new RandomizedQueue([1, 2, 3])
      q.clear()
      expect(q.size).toBe(0)
      expect(q.isEmpty).toBe(true)
    })

    it('should be safe on empty queue', () => {
      const q = new RandomizedQueue<number>()
      q.clear()
      expect(q.size).toBe(0)
    })

    it('should be safe to call multiple times', () => {
      const q = new RandomizedQueue<number>()
      q.enqueue(1)
      q.clear()
      q.clear()
      expect(q.size).toBe(0)
    })

    it('should allow enqueue after clear', () => {
      const q = new RandomizedQueue([1, 2])
      q.clear()
      q.enqueue(3)
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(3)
    })

    it('should return void', () => {
      const q = new RandomizedQueue<number>()
      expect(q.clear()).toBeUndefined()
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty queue', () => {
      expect(new RandomizedQueue().toArray()).toEqual([])
    })

    it('should return all values', () => {
      const q = new RandomizedQueue([1, 2, 3])
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('should return new array each call', () => {
      const q = new RandomizedQueue([1])
      const a = q.toArray()
      const b = q.toArray()
      expect(a).not.toBe(b)
      expect(a).toEqual(b)
    })

    it('should reflect current state after dequeue', () => {
      const q = new RandomizedQueue([1, 2, 3])
      q.dequeue()
      expect(q.size).toBe(2)
      const arr = q.toArray()
      expect(arr.length).toBe(2)
    })
  })

  describe('clone', () => {
    it('should clone empty queue', () => {
      const q = new RandomizedQueue<number>()
      const c = q.clone()
      expect(c.size).toBe(0)
      expect(c.isEmpty).toBe(true)
    })

    it('should clone non-empty queue', () => {
      const q = new RandomizedQueue([1, 2, 3])
      const c = q.clone()
      expect(c.size).toBe(3)
      expect(c.toArray()).toEqual([1, 2, 3])
    })

    it('should be independent from original', () => {
      const q = new RandomizedQueue([1, 2])
      const c = q.clone()
      c.enqueue(3)
      expect(q.size).toBe(2)
      expect(c.size).toBe(3)
    })

    it('should not affect original on dequeue', () => {
      const q = new RandomizedQueue([1, 2, 3])
      const c = q.clone()
      c.dequeue()
      expect(q.size).toBe(3)
      expect(c.size).toBe(2)
    })

    it('should preserve element order', () => {
      const q = new RandomizedQueue([10, 20, 30, 40, 50])
      const c = q.clone()
      expect(c.toArray()).toEqual(q.toArray())
    })
  })

  describe('fromArray', () => {
    it('should create queue from array', () => {
      const q = RandomizedQueue.fromArray([1, 2, 3])
      expect(q.size).toBe(3)
      expect(q.contains(1)).toBe(true)
    })

    it('should create empty queue from empty array', () => {
      const q = RandomizedQueue.fromArray([])
      expect(q.size).toBe(0)
    })

    it('should create queue from single element', () => {
      const q = RandomizedQueue.fromArray([42])
      expect(q.size).toBe(1)
      expect(q.peek()).toBe(42)
    })

    it('should work with strings', () => {
      const q = RandomizedQueue.fromArray(['a', 'b'])
      expect(q.size).toBe(2)
    })
  })

  describe('forEach', () => {
    it('should not call callback for empty queue', () => {
      const q = new RandomizedQueue<number>()
      const items: number[] = []
      q.forEach((v) => items.push(v))
      expect(items).toEqual([])
    })

    it('should iterate all elements in order', () => {
      const q = new RandomizedQueue([3, 7, 1])
      const items: number[] = []
      q.forEach((v) => items.push(v))
      expect(items).toEqual([3, 7, 1])
    })

    it('should provide index', () => {
      const q = new RandomizedQueue([10, 20, 30])
      const indices: number[] = []
      q.forEach((_v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('should iterate single element', () => {
      const q = new RandomizedQueue([5])
      const items: number[] = []
      q.forEach((v) => items.push(v))
      expect(items).toEqual([5])
    })

    it('should return void', () => {
      const q = new RandomizedQueue([1])
      expect(q.forEach(() => {})).toBeUndefined()
    })
  })

  describe('[Symbol.iterator]', () => {
    it('should iterate empty queue', () => {
      const q = new RandomizedQueue<number>()
      const items: number[] = []
      for (const v of q) items.push(v)
      expect(items).toEqual([])
    })

    it('should iterate all elements', () => {
      const q = new RandomizedQueue([3, 1, 7])
      const items: number[] = []
      for (const v of q) items.push(v)
      expect(items).toEqual([3, 1, 7])
    })

    it('should work with spread operator', () => {
      const q = new RandomizedQueue([1, 2])
      expect([...q]).toEqual([1, 2])
    })

    it('should work with Array.from', () => {
      const q = new RandomizedQueue([5])
      expect(Array.from(q)).toEqual([5])
    })

    it('should work with destructuring', () => {
      const q = new RandomizedQueue([3, 7])
      const [first] = q
      expect(first).toBe(3)
    })

    it('should work after clear and re-add', () => {
      const q = new RandomizedQueue([1, 2])
      q.clear()
      q.enqueue(5)
      expect([...q]).toEqual([5])
    })
  })

  describe('contains', () => {
    it('should return false for empty queue', () => {
      expect(new RandomizedQueue<number>().contains(1)).toBe(false)
    })

    it('should return true for existing value', () => {
      const q = new RandomizedQueue([1, 2, 3])
      expect(q.contains(2)).toBe(true)
    })

    it('should return false for non-existing value', () => {
      const q = new RandomizedQueue([1, 2, 3])
      expect(q.contains(99)).toBe(false)
    })

    it('should return false after dequeue removes it', () => {
      const q = new RandomizedQueue([1])
      q.dequeue()
      expect(q.contains(1)).toBe(false)
    })

    it('should work with objects by reference', () => {
      const obj = { x: 1 }
      const q = new RandomizedQueue([obj])
      expect(q.contains(obj)).toBe(true)
      expect(q.contains({ x: 1 })).toBe(false)
    })
  })

  describe('indexOf', () => {
    it('should return -1 for empty queue', () => {
      expect(new RandomizedQueue<number>().indexOf(1)).toBe(-1)
    })

    it('should return correct index', () => {
      const q = new RandomizedQueue([10, 20, 30])
      expect(q.indexOf(20)).toBe(1)
    })

    it('should return 0 for first element', () => {
      const q = new RandomizedQueue([10, 20, 30])
      expect(q.indexOf(10)).toBe(0)
    })

    it('should return -1 for non-existing', () => {
      const q = new RandomizedQueue([10, 20, 30])
      expect(q.indexOf(99)).toBe(-1)
    })

    it('should return first index of duplicate', () => {
      const q = new RandomizedQueue([1, 2, 1])
      expect(q.indexOf(1)).toBe(0)
    })
  })

  describe('remove', () => {
    it('should remove existing value and return true', () => {
      const q = new RandomizedQueue([1, 2, 3])
      expect(q.remove(2)).toBe(true)
      expect(q.size).toBe(2)
      expect(q.contains(2)).toBe(false)
    })

    it('should return false for non-existing value', () => {
      const q = new RandomizedQueue([1, 2, 3])
      expect(q.remove(99)).toBe(false)
      expect(q.size).toBe(3)
    })

    it('should return false for empty queue', () => {
      const q = new RandomizedQueue<number>()
      expect(q.remove(1)).toBe(false)
    })

    it('should remove first element', () => {
      const q = new RandomizedQueue([1, 2, 3])
      expect(q.remove(1)).toBe(true)
      expect(q.contains(1)).toBe(false)
      expect(q.contains(2)).toBe(true)
      expect(q.contains(3)).toBe(true)
    })

    it('should remove last element', () => {
      const q = new RandomizedQueue([1, 2, 3])
      expect(q.remove(3)).toBe(true)
      expect(q.contains(1)).toBe(true)
      expect(q.contains(2)).toBe(true)
      expect(q.contains(3)).toBe(false)
    })

    it('should remove only element', () => {
      const q = new RandomizedQueue([42])
      expect(q.remove(42)).toBe(true)
      expect(q.size).toBe(0)
      expect(q.isEmpty).toBe(true)
    })

    it('should remove first occurrence of duplicate', () => {
      const q = new RandomizedQueue([1, 2, 1])
      q.remove(1)
      expect(q.size).toBe(2)
    })
  })

  describe('removeAt', () => {
    it('should remove element at index and return it', () => {
      const q = new RandomizedQueue([10, 20, 30])
      expect(q.removeAt(1)).toBe(20)
      expect(q.size).toBe(2)
    })

    it('should throw for negative index', () => {
      const q = new RandomizedQueue([1, 2])
      expect(() => q.removeAt(-1)).toThrow(RangeError)
    })

    it('should throw for index >= size', () => {
      const q = new RandomizedQueue([1, 2])
      expect(() => q.removeAt(2)).toThrow(RangeError)
    })

    it('should throw for empty queue', () => {
      const q = new RandomizedQueue<number>()
      expect(() => q.removeAt(0)).toThrow(RangeError)
    })

    it('should remove at index 0', () => {
      const q = new RandomizedQueue([10, 20, 30])
      expect(q.removeAt(0)).toBe(10)
      expect(q.size).toBe(2)
    })

    it('should remove at last index', () => {
      const q = new RandomizedQueue([10, 20, 30])
      expect(q.removeAt(2)).toBe(30)
      expect(q.size).toBe(2)
    })

    it.skip("should drain queue via removeAt(0)', () => {
      const q = new RandomizedQueue([1, 2, 3])
      const vals: number[] = []
      while (!q.isEmpty) {
        vals.push(q.removeAt(0))
      }
      expect(vals).toEqual([1, 2, 3])
    })
  })

  describe('shuffle', () => {
    it('should handle empty queue', () => {
      const q = new RandomizedQueue<number>()
      q.shuffle()
      expect(q.size).toBe(0)
    })

    it('should handle single element', () => {
      const q = new RandomizedQueue([1])
      q.shuffle()
      expect(q.size).toBe(1)
      expect(q.contains(1)).toBe(true)
    })

    it('should not lose elements', () => {
      const q = new RandomizedQueue([1, 2, 3, 4, 5])
      q.shuffle()
      expect(q.size).toBe(5)
      expect(q.toArray().sort()).toEqual([1, 2, 3, 4, 5])
    })

    it('should return void', () => {
      const q = new RandomizedQueue([1, 2])
      expect(q.shuffle()).toBeUndefined()
    })

    it('should eventually change order', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      let shuffled = false
      for (let i = 0; i < 50; i++) {
        const q = new RandomizedQueue([...original])
        q.shuffle()
        if (q.toArray().join(',') !== original.join(',')) {
          shuffled = true
          break
        }
      }
      expect(shuffled).toBe(true)
    })
  })

  describe('random', () => {
    it('should return empty array for empty queue', () => {
      const q = new RandomizedQueue<number>()
      expect(q.random()).toEqual([])
    })

    it('should return single element when no n specified', () => {
      const q = new RandomizedQueue([42])
      expect(q.random()).toEqual([42])
    })

    it('should return random element without removing', () => {
      const q = new RandomizedQueue([1, 2, 3, 4, 5])
      const vals = q.random()
      expect(vals.length).toBe(1)
      expect([1, 2, 3, 4, 5]).toContain(vals[0])
      expect(q.size).toBe(5)
    })

    it('should return n elements without replacement', () => {
      const q = new RandomizedQueue([1, 2, 3, 4, 5])
      const vals = q.random(3)
      expect(vals.length).toBe(3)
      const unique = new Set(vals)
      expect(unique.size).toBe(3)
    })

    it('should cap n at queue size', () => {
      const q = new RandomizedQueue([1, 2, 3])
      const vals = q.random(10)
      expect(vals.length).toBe(3)
    })

    it('should return empty array for n=0', () => {
      const q = new RandomizedQueue([1, 2, 3])
      expect(q.random(0)).toEqual([])
    })

    it('should return all elements when n equals size', () => {
      const q = new RandomizedQueue([1, 2, 3])
      const vals = q.random(3)
      expect(vals.sort()).toEqual([1, 2, 3])
    })

    it('should not modify the queue', () => {
      const q = new RandomizedQueue([1, 2, 3, 4, 5])
      q.random(3)
      expect(q.size).toBe(5)
    })
  })

  describe('at', () => {
    it('should return element at index', () => {
      const q = new RandomizedQueue([10, 20, 30])
      expect(q.at(0)).toBe(10)
      expect(q.at(1)).toBe(20)
      expect(q.at(2)).toBe(30)
    })

    it('should throw for negative index', () => {
      const q = new RandomizedQueue([1, 2])
      expect(() => q.at(-1)).toThrow(RangeError)
    })

    it('should throw for index >= size', () => {
      const q = new RandomizedQueue([1, 2])
      expect(() => q.at(2)).toThrow(RangeError)
    })

    it('should throw for empty queue', () => {
      const q = new RandomizedQueue<number>()
      expect(() => q.at(0)).toThrow(RangeError)
    })
  })

  describe('first', () => {
    it('should throw on empty queue', () => {
      const q = new RandomizedQueue<number>()
      expect(() => q.first()).toThrow('Cannot get first element from empty queue')
    })

    it('should return first element', () => {
      const q = new RandomizedQueue([10, 20, 30])
      expect(q.first()).toBe(10)
    })

    it('should not remove element', () => {
      const q = new RandomizedQueue([1, 2])
      q.first()
      expect(q.size).toBe(2)
    })
  })

  describe('last', () => {
    it('should throw on empty queue', () => {
      const q = new RandomizedQueue<number>()
      expect(() => q.last()).toThrow('Cannot get last element from empty queue')
    })

    it('should return last element', () => {
      const q = new RandomizedQueue([10, 20, 30])
      expect(q.last()).toBe(30)
    })

    it('should not remove element', () => {
      const q = new RandomizedQueue([1, 2])
      q.last()
      expect(q.size).toBe(2)
    })
  })

  describe('count', () => {
    it('should return 0 for empty queue', () => {
      expect(new RandomizedQueue().count()).toBe(0)
    })

    it('should return size', () => {
      const q = new RandomizedQueue([1, 2, 3])
      expect(q.count()).toBe(3)
    })

    it('should be same as size getter', () => {
      const q = new RandomizedQueue([1, 2, 3])
      expect(q.count()).toBe(q.size)
    })
  })

  describe('toString', () => {
    it('should represent empty queue', () => {
      const q = new RandomizedQueue<number>()
      expect(q.toString()).toBe('RandomizedQueue(0) []')
    })

    it('should represent non-empty queue', () => {
      const q = new RandomizedQueue([1, 2, 3])
      expect(q.toString()).toBe('RandomizedQueue(3) [1, 2, 3]')
    })

    it('should represent string elements', () => {
      const q = new RandomizedQueue(['a', 'b'])
      expect(q.toString()).toBe('RandomizedQueue(2) [a, b]')
    })
  })

  describe('join', () => {
    it('should join with default separator', () => {
      const q = new RandomizedQueue([1, 2, 3])
      expect(q.join()).toBe('1,2,3')
    })

    it('should join with custom separator', () => {
      const q = new RandomizedQueue([1, 2, 3])
      expect(q.join('-')).toBe('1-2-3')
    })

    it('should join empty queue', () => {
      const q = new RandomizedQueue<number>()
      expect(q.join()).toBe('')
    })

    it('should join single element', () => {
      const q = new RandomizedQueue([42])
      expect(q.join(',')).toBe('42')
    })

    it('should join strings', () => {
      const q = new RandomizedQueue(['a', 'b', 'c'])
      expect(q.join('|')).toBe('a|b|c')
    })
  })

  describe('getStats', () => {
    it('should return stats for empty queue', () => {
      const q = new RandomizedQueue<number>()
      const stats = q.getStats()
      expect(stats.size).toBe(0)
      expect(stats.capacity).toBe(0)
    })

    it('should return stats for non-empty queue', () => {
      const q = new RandomizedQueue([1, 2, 3])
      const stats = q.getStats()
      expect(stats.size).toBe(3)
      expect(stats.capacity).toBe(3)
    })

    it('should update after mutations', () => {
      const q = new RandomizedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      expect(q.getStats().size).toBe(2)
      q.dequeue()
      expect(q.getStats().size).toBe(1)
    })
  })

  describe('type exports', () => {
    it('should export the class and types', async () => {
      const mod = await import('../../src/core/randomized-queue/index.js')
      expect(mod.RandomizedQueue).toBeDefined()
      expect(mod.DEFAULT_RANDOMIZED_QUEUE_OPTIONS).toBeDefined()
    })
  })

  describe('edge cases', () => {
    it('should handle boolean values', () => {
      const q = new RandomizedQueue<boolean>()
      q.enqueue(true)
      q.enqueue(false)
      expect(q.size).toBe(2)
      expect(q.contains(true)).toBe(true)
      expect(q.contains(false)).toBe(true)
    })

    it('should handle object values by reference', () => {
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      const q = new RandomizedQueue<object>()
      q.enqueue(obj1)
      q.enqueue(obj2)
      expect(q.contains(obj1)).toBe(true)
      expect(q.contains(obj2)).toBe(true)
      expect(q.contains({ id: 1 })).toBe(false)
    })

    it('should handle empty string', () => {
      const q = new RandomizedQueue<string>()
      q.enqueue('')
      expect(q.contains('')).toBe(true)
      expect(q.size).toBe(1)
    })

    it('should handle Symbol values', () => {
      const sym1 = Symbol('a')
      const sym2 = Symbol('b')
      const q = new RandomizedQueue<symbol>()
      q.enqueue(sym1)
      q.enqueue(sym2)
      expect(q.size).toBe(2)
      expect(q.contains(sym1)).toBe(true)
    })

    it('should handle mixed object types', () => {
      const arr = [1, 2, 3]
      const obj = { a: 1 }
      const fn = () => {}
      const q = new RandomizedQueue<unknown>([arr, obj, fn])
      expect(q.size).toBe(3)
      expect(q.contains(arr)).toBe(true)
      expect(q.contains(obj)).toBe(true)
      expect(q.contains(fn)).toBe(true)
    })

    it('should handle enqueue/dequeue cycles', () => {
      const q = new RandomizedQueue<number>()
      for (let round = 0; round < 10; round++) {
        for (let i = 0; i < 5; i++) q.enqueue(i)
        expect(q.size).toBe(5 + round * 5)
      }
    })

    it('should handle clear/enqueue cycles', () => {
      const q = new RandomizedQueue<number>()
      for (let round = 0; round < 10; round++) {
        q.enqueue(1)
        q.enqueue(2)
        q.enqueue(3)
        expect(q.size).toBe(3)
        q.clear()
        expect(q.size).toBe(0)
      }
    })
  })

  describe('large queues', () => {
    it('should handle 1000 elements', () => {
      const q = new RandomizedQueue<number>()
      for (let i = 0; i < 1000; i++) q.enqueue(i)
      expect(q.size).toBe(1000)
    })

    it('should dequeue from 1000 elements', () => {
      const q = new RandomizedQueue<number>()
      for (let i = 0; i < 1000; i++) q.enqueue(i)
      for (let i = 0; i < 500; i++) q.dequeue()
      expect(q.size).toBe(500)
    })

    it('should sample from large queue', () => {
      const q = new RandomizedQueue<number>()
      for (let i = 0; i < 1000; i++) q.enqueue(i)
      for (let i = 0; i < 100; i++) {
        const val = q.sample()
        expect(val).toBeGreaterThanOrEqual(0)
        expect(val).toBeLessThan(1000)
      }
    })

    it('should handle 10000 elements', () => {
      const q = new RandomizedQueue<number>()
      for (let i = 0; i < 10000; i++) q.enqueue(i)
      expect(q.size).toBe(10000)
    })

    it('should shuffle large queue', () => {
      const q = new RandomizedQueue<number>()
      for (let i = 0; i < 1000; i++) q.enqueue(i)
      q.shuffle()
      expect(q.size).toBe(1000)
      const arr = q.toArray().sort((a, b) => a - b)
      for (let i = 0; i < 1000; i++) {
        expect(arr[i]).toBe(i)
      }
    })

    it('should get random n elements from large queue', () => {
      const q = new RandomizedQueue<number>()
      for (let i = 0; i < 1000; i++) q.enqueue(i)
      const vals = q.random(10)
      expect(vals.length).toBe(10)
      const unique = new Set(vals)
      expect(unique.size).toBe(10)
      for (const v of vals) {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThan(1000)
      }
    })
  })

  describe('combined operations', () => {
    it('should handle enqueue-dequeue-enqueue sequence', () => {
      const q = new RandomizedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.dequeue()
      q.enqueue(3)
      q.enqueue(1)
      expect(q.size).toBe(3)
    })

    it('should handle clone after complex operations', () => {
      const q = new RandomizedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      q.enqueue(4)
      q.enqueue(5)
      const c = q.clone()
      expect(c.size).toBe(q.size)
    })

    it('should handle fromArray with subsequent mutations', () => {
      const q = RandomizedQueue.fromArray([1, 2, 3, 4, 5])
      q.dequeue()
      q.enqueue(6)
      expect(q.size).toBe(5)
    })

    it('should handle forEach with sum', () => {
      const q = new RandomizedQueue([10, 20, 30])
      let sum = 0
      q.forEach((v) => { sum += v })
      expect(sum).toBe(60)
    })

    it('should handle string queue throughout lifecycle', () => {
      const q = new RandomizedQueue<string>()
      q.enqueue('hello')
      q.enqueue('world')
      q.enqueue('!')
      expect(q.size).toBe(3)
      q.dequeue()
      expect(q.size).toBe(2)
      const arr = q.toArray()
      expect(arr.length).toBe(2)
    })

    it('should handle remove after shuffle', () => {
      const q = new RandomizedQueue([1, 2, 3, 4, 5])
      q.shuffle()
      expect(q.remove(3)).toBe(true)
      expect(q.contains(3)).toBe(false)
      expect(q.size).toBe(4)
    })

    it('should handle random after remove', () => {
      const q = new RandomizedQueue([1, 2, 3, 4, 5])
      q.remove(3)
      const vals = q.random(4)
      expect(vals.length).toBe(4)
      expect(vals).not.toContain(3)
    })

    it('should handle removeAt after enqueue', () => {
      const q = new RandomizedQueue<number>()
      q.enqueue(10)
      q.enqueue(20)
      q.enqueue(30)
      const removed = q.removeAt(1)
      expect(removed).toBe(20)
      expect(q.size).toBe(2)
    })

    it('should handle peek and peekBack consistency', () => {
      const q = new RandomizedQueue([1, 2, 3])
      expect(q.peek()).toBe(1)
      expect(q.peekBack()).toBe(3)
      expect(q.first()).toBe(1)
      expect(q.last()).toBe(3)
    })

    it('should handle toString after mutations', () => {
      const q = new RandomizedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      q.dequeue()
      expect(q.toString()).toContain('RandomizedQueue(2)')
    })

    it('should handle join after mutations', () => {
      const q = new RandomizedQueue<number>()
      q.enqueue(1)
      q.enqueue(2)
      q.enqueue(3)
      const result = q.join(' + ')
      expect(result).toBe('1 + 2 + 3')
    })

    it('should handle iterator after remove', () => {
      const q = new RandomizedQueue([1, 2, 3])
      q.remove(2)
      const items = [...q].sort()
      expect(items).toEqual([1, 3])
    })

    it('should handle at with forEach consistency', () => {
      const q = new RandomizedQueue([10, 20, 30])
      const byAt: number[] = []
      for (let i = 0; i < q.size; i++) {
        byAt.push(q.at(i))
      }
      const byForEach: number[] = []
      q.forEach((v) => byForEach.push(v))
      expect(byAt).toEqual(byForEach)
    })
  })

  describe('dequeue distribution', () => {
    it('should have roughly uniform dequeue distribution', () => {
      const counts = new Map<number, number>()
      for (const v of [1, 2, 3, 4]) counts.set(v, 0)
      const trials = 1000
      for (let i = 0; i < trials; i++) {
        const q = new RandomizedQueue([1, 2, 3, 4])
        const val = q.dequeue()
        counts.set(val, counts.get(val)! + 1)
      }
      const expected = trials / 4
      for (const count of counts.values()) {
        expect(count).toBeGreaterThan(expected * 0.5)
        expect(count).toBeLessThan(expected * 1.5)
      }
    })

    it('should cover all elements over many dequeue operations', () => {
      const items = [10, 20, 30, 40, 50]
      const seen = new Set<number>()
      for (let i = 0; i < 1000; i++) {
        const q = new RandomizedQueue([...items])
        seen.add(q.dequeue())
        if (seen.size === items.length) break
      }
      expect(seen.size).toBe(items.length)
    })
  })

  describe('multiple random calls', () => {
    it('should return different results over many calls', () => {
      const q = new RandomizedQueue([1, 2, 3, 4, 5])
      const results = new Set<string>()
      for (let i = 0; i < 100; i++) {
        results.add(q.random().join(','))
      }
      expect(results.size).toBeGreaterThan(1)
    })

    it('should return all unique elements in random(n) = size', () => {
      const q = new RandomizedQueue([1, 2, 3, 4, 5])
      const vals = q.random(5)
      expect(vals.sort()).toEqual([1, 2, 3, 4, 5])
    })
  })
})
