import { describe, it, expect, beforeEach } from 'vitest'
import { IndexedQueue } from '../../src/core/indexed-queue/indexed-queue.js'
import { DEFAULT_INDEXED_QUEUE_OPTIONS } from '../../src/core/indexed-queue/types.js'

describe('IndexedQueue', () => {
  describe('constructor', () => {
    it('creates empty queue with no arguments', () => {
      const q = new IndexedQueue<number>()
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('creates queue from initial items', () => {
      const q = new IndexedQueue([1, 2, 3])
      expect(q.size()).toBe(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('creates queue from empty array', () => {
      const q = new IndexedQueue<number>([])
      expect(q.size()).toBe(0)
      expect(q.isEmpty()).toBe(true)
    })

    it('creates queue from single item array', () => {
      const q = new IndexedQueue(['hello'])
      expect(q.size()).toBe(1)
      expect(q.peekFront()).toBe('hello')
    })

    it('handles undefined initial items as empty', () => {
      const q = new IndexedQueue<number>(undefined)
      expect(q.size()).toBe(0)
    })

    it('handles string elements', () => {
      const q = new IndexedQueue(['a', 'b', 'c'])
      expect(q.size()).toBe(3)
      expect(q.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('handles object elements', () => {
      const obj = { x: 1 }
      const q = new IndexedQueue([obj])
      expect(q.get(0)).toBe(obj)
    })

    it('handles null elements', () => {
      const q = new IndexedQueue([null, null, null])
      expect(q.size()).toBe(3)
    })

    it('handles boolean elements', () => {
      const q = new IndexedQueue([true, false, true])
      expect(q.size()).toBe(3)
    })
  })

  describe('pushBack', () => {
    it('adds item to back of empty queue', () => {
      const q = new IndexedQueue<number>()
      q.pushBack(1)
      expect(q.size()).toBe(1)
      expect(q.peekFront()).toBe(1)
      expect(q.peekBack()).toBe(1)
    })

    it('adds items maintaining order', () => {
      const q = new IndexedQueue<number>()
      q.pushBack(1)
      q.pushBack(2)
      q.pushBack(3)
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('returns void', () => {
      const q = new IndexedQueue<number>()
      const result = q.pushBack(1)
      expect(result).toBeUndefined()
    })
  })

  describe('pushFront', () => {
    it('adds item to front of empty queue', () => {
      const q = new IndexedQueue<number>()
      q.pushFront(1)
      expect(q.size()).toBe(1)
      expect(q.peekFront()).toBe(1)
      expect(q.peekBack()).toBe(1)
    })

    it('prepends items', () => {
      const q = new IndexedQueue<number>()
      q.pushFront(1)
      q.pushFront(2)
      q.pushFront(3)
      expect(q.toArray()).toEqual([3, 2, 1])
    })

    it('returns void', () => {
      const q = new IndexedQueue<number>()
      const result = q.pushFront(1)
      expect(result).toBeUndefined()
    })
  })

  describe('popBack', () => {
    it('throws on empty queue', () => {
      const q = new IndexedQueue<number>()
      expect(() => q.popBack()).toThrow('IndexedQueue is empty')
    })

    it('removes and returns last item', () => {
      const q = new IndexedQueue([1, 2, 3])
      expect(q.popBack()).toBe(3)
      expect(q.toArray()).toEqual([1, 2])
    })

    it('handles single element', () => {
      const q = new IndexedQueue([42])
      expect(q.popBack()).toBe(42)
      expect(q.isEmpty()).toBe(true)
    })

    it('removes all elements one by one', () => {
      const q = new IndexedQueue([1, 2, 3])
      expect(q.popBack()).toBe(3)
      expect(q.popBack()).toBe(2)
      expect(q.popBack()).toBe(1)
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('popFront', () => {
    it('throws on empty queue', () => {
      const q = new IndexedQueue<number>()
      expect(() => q.popFront()).toThrow('IndexedQueue is empty')
    })

    it('removes and returns first item', () => {
      const q = new IndexedQueue([1, 2, 3])
      expect(q.popFront()).toBe(1)
      expect(q.toArray()).toEqual([2, 3])
    })

    it('handles single element', () => {
      const q = new IndexedQueue([42])
      expect(q.popFront()).toBe(42)
      expect(q.isEmpty()).toBe(true)
    })

    it('removes all elements one by one', () => {
      const q = new IndexedQueue([1, 2, 3])
      expect(q.popFront()).toBe(1)
      expect(q.popFront()).toBe(2)
      expect(q.popFront()).toBe(3)
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('peekFront', () => {
    it('throws on empty queue', () => {
      const q = new IndexedQueue<number>()
      expect(() => q.peekFront()).toThrow('IndexedQueue is empty')
    })

    it('returns first item without removing', () => {
      const q = new IndexedQueue([1, 2, 3])
      expect(q.peekFront()).toBe(1)
      expect(q.size()).toBe(3)
    })

    it('returns same item on multiple calls', () => {
      const q = new IndexedQueue([10, 20])
      expect(q.peekFront()).toBe(10)
      expect(q.peekFront()).toBe(10)
      expect(q.peekFront()).toBe(10)
    })
  })

  describe('peekBack', () => {
    it('throws on empty queue', () => {
      const q = new IndexedQueue<number>()
      expect(() => q.peekBack()).toThrow('IndexedQueue is empty')
    })

    it('returns last item without removing', () => {
      const q = new IndexedQueue([1, 2, 3])
      expect(q.peekBack()).toBe(3)
      expect(q.size()).toBe(3)
    })

    it('returns same item on multiple calls', () => {
      const q = new IndexedQueue([10, 20])
      expect(q.peekBack()).toBe(20)
      expect(q.peekBack()).toBe(20)
    })
  })

  describe('get', () => {
    it('throws on negative index', () => {
      const q = new IndexedQueue([1, 2, 3])
      expect(() => q.get(-1)).toThrow(RangeError)
    })

    it('throws on index >= size', () => {
      const q = new IndexedQueue([1, 2, 3])
      expect(() => q.get(3)).toThrow(RangeError)
      expect(() => q.get(100)).toThrow(RangeError)
    })

    it('returns item at valid index', () => {
      const q = new IndexedQueue([10, 20, 30])
      expect(q.get(0)).toBe(10)
      expect(q.get(1)).toBe(20)
      expect(q.get(2)).toBe(30)
    })

    it('works on empty queue after operations', () => {
      const q = new IndexedQueue<number>()
      q.pushBack(5)
      q.popFront()
      expect(() => q.get(0)).toThrow(RangeError)
    })
  })

  describe('set', () => {
    it('throws on negative index', () => {
      const q = new IndexedQueue([1, 2, 3])
      expect(() => q.set(-1, 99)).toThrow(RangeError)
    })

    it('throws on index >= size', () => {
      const q = new IndexedQueue([1, 2, 3])
      expect(() => q.set(3, 99)).toThrow(RangeError)
    })

    it('updates value at index', () => {
      const q = new IndexedQueue([1, 2, 3])
      q.set(1, 99)
      expect(q.get(1)).toBe(99)
      expect(q.toArray()).toEqual([1, 99, 3])
    })

    it('updates first element', () => {
      const q = new IndexedQueue([1, 2, 3])
      q.set(0, 100)
      expect(q.get(0)).toBe(100)
    })

    it('updates last element', () => {
      const q = new IndexedQueue([1, 2, 3])
      q.set(2, 200)
      expect(q.get(2)).toBe(200)
    })
  })

  describe('indexOf', () => {
    it('returns -1 for item not found', () => {
      const q = new IndexedQueue([1, 2, 3])
      expect(q.indexOf(99)).toBe(-1)
    })

    it('returns index of found item', () => {
      const q = new IndexedQueue([10, 20, 30])
      expect(q.indexOf(10)).toBe(0)
      expect(q.indexOf(20)).toBe(1)
      expect(q.indexOf(30)).toBe(2)
    })

    it('returns first occurrence of duplicate', () => {
      const q = new IndexedQueue([1, 2, 1, 2])
      expect(q.indexOf(1)).toBe(0)
      expect(q.indexOf(2)).toBe(1)
    })

    it('returns -1 on empty queue', () => {
      const q = new IndexedQueue<number>()
      expect(q.indexOf(1)).toBe(-1)
    })

    it('uses strict equality', () => {
      const q = new IndexedQueue<number>([1, 2, 3])
      expect(q.indexOf(1)).toBe(0)
      expect(q.indexOf(4)).toBe(-1)
    })

    it('finds undefined if stored', () => {
      const q = new IndexedQueue<undefined>([undefined, undefined])
      expect(q.indexOf(undefined)).toBe(0)
    })
  })

  describe('includes', () => {
    it('returns true for existing item', () => {
      const q = new IndexedQueue([1, 2, 3])
      expect(q.includes(2)).toBe(true)
    })

    it('returns false for missing item', () => {
      const q = new IndexedQueue([1, 2, 3])
      expect(q.includes(99)).toBe(false)
    })

    it('returns false on empty queue', () => {
      const q = new IndexedQueue<number>()
      expect(q.includes(1)).toBe(false)
    })

    it('finds first and last elements', () => {
      const q = new IndexedQueue([10, 20, 30])
      expect(q.includes(10)).toBe(true)
      expect(q.includes(30)).toBe(true)
    })
  })

  describe('slice', () => {
    it('returns full copy with no arguments', () => {
      const q = new IndexedQueue([1, 2, 3, 4, 5])
      expect(q.slice()).toEqual([1, 2, 3, 4, 5])
    })

    it('slices from start index', () => {
      const q = new IndexedQueue([1, 2, 3, 4, 5])
      expect(q.slice(2)).toEqual([3, 4, 5])
    })

    it('slices with start and end', () => {
      const q = new IndexedQueue([1, 2, 3, 4, 5])
      expect(q.slice(1, 4)).toEqual([2, 3, 4])
    })

    it('handles negative start', () => {
      const q = new IndexedQueue([1, 2, 3, 4, 5])
      expect(q.slice(-2)).toEqual([4, 5])
    })

    it('handles negative end', () => {
      const q = new IndexedQueue([1, 2, 3, 4, 5])
      expect(q.slice(0, -1)).toEqual([1, 2, 3, 4])
    })

    it('returns empty for out of bounds range', () => {
      const q = new IndexedQueue([1, 2, 3])
      expect(q.slice(10, 20)).toEqual([])
    })

    it('clamps negative start to 0', () => {
      const q = new IndexedQueue([1, 2, 3])
      expect(q.slice(-100)).toEqual([1, 2, 3])
    })

    it('clamps end to size', () => {
      const q = new IndexedQueue([1, 2, 3])
      expect(q.slice(0, 100)).toEqual([1, 2, 3])
    })

    it('returns empty for empty queue', () => {
      const q = new IndexedQueue<number>()
      expect(q.slice()).toEqual([])
    })

    it('returns new array (not reference)', () => {
      const q = new IndexedQueue([1, 2, 3])
      const s = q.slice()
      s.push(99)
      expect(q.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('size', () => {
    it('returns 0 for empty queue', () => {
      const q = new IndexedQueue<number>()
      expect(q.size()).toBe(0)
    })

    it('returns correct count after pushes', () => {
      const q = new IndexedQueue<number>()
      q.pushBack(1)
      expect(q.size()).toBe(1)
      q.pushBack(2)
      expect(q.size()).toBe(2)
    })

    it('returns correct count after pops', () => {
      const q = new IndexedQueue([1, 2, 3])
      q.popFront()
      expect(q.size()).toBe(2)
      q.popBack()
      expect(q.size()).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new queue', () => {
      expect(new IndexedQueue().isEmpty()).toBe(true)
    })

    it('returns false after push', () => {
      const q = new IndexedQueue<number>()
      q.pushBack(1)
      expect(q.isEmpty()).toBe(false)
    })

    it('returns true after all pops', () => {
      const q = new IndexedQueue([1])
      q.popFront()
      expect(q.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('empties the queue', () => {
      const q = new IndexedQueue([1, 2, 3])
      q.clear()
      expect(q.isEmpty()).toBe(true)
      expect(q.size()).toBe(0)
    })

    it('allows operations after clear', () => {
      const q = new IndexedQueue([1, 2, 3])
      q.clear()
      q.pushBack(10)
      expect(q.size()).toBe(1)
      expect(q.peekFront()).toBe(10)
    })

    it('works on already empty queue', () => {
      const q = new IndexedQueue<number>()
      q.clear()
      expect(q.isEmpty()).toBe(true)
    })

    it('returns void', () => {
      const q = new IndexedQueue([1])
      expect(q.clear()).toBeUndefined()
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty queue', () => {
      const q = new IndexedQueue<number>()
      expect(q.toArray()).toEqual([])
    })

    it('returns ordered elements', () => {
      const q = new IndexedQueue([1, 2, 3])
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('returns a new array each time', () => {
      const q = new IndexedQueue([1, 2, 3])
      const a1 = q.toArray()
      const a2 = q.toArray()
      expect(a1).not.toBe(a2)
      expect(a1).toEqual(a2)
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const q = new IndexedQueue([1, 2, 3])
      const c = q.clone()
      expect(c.toArray()).toEqual([1, 2, 3])
      expect(c.size()).toBe(3)
    })

    it('clone modifications do not affect original', () => {
      const q = new IndexedQueue([1, 2, 3])
      const c = q.clone()
      c.pushBack(4)
      expect(q.size()).toBe(3)
      expect(c.size()).toBe(4)
    })

    it('original modifications do not affect clone', () => {
      const q = new IndexedQueue([1, 2, 3])
      const c = q.clone()
      q.pushBack(4)
      expect(c.size()).toBe(3)
      expect(q.size()).toBe(4)
    })

    it('clone of empty queue is empty', () => {
      const q = new IndexedQueue<number>()
      const c = q.clone()
      expect(c.isEmpty()).toBe(true)
    })

    it('clone preserves element values', () => {
      const q = new IndexedQueue([10, 20, 30])
      const c = q.clone()
      expect(c.get(0)).toBe(10)
      expect(c.get(1)).toBe(20)
      expect(c.get(2)).toBe(30)
    })
  })

  describe('forEach', () => {
    it('iterates over all elements', () => {
      const q = new IndexedQueue([1, 2, 3])
      const collected: number[] = []
      q.forEach((item) => collected.push(item))
      expect(collected).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const q = new IndexedQueue([10, 20, 30])
      const indices: number[] = []
      q.forEach((_item, idx) => indices.push(idx))
      expect(indices).toEqual([0, 1, 2])
    })

    it('does nothing on empty queue', () => {
      const q = new IndexedQueue<number>()
      let calls = 0
      q.forEach(() => calls++)
      expect(calls).toBe(0)
    })

    it('returns void', () => {
      const q = new IndexedQueue([1])
      expect(q.forEach(() => {})).toBeUndefined()
    })
  })

  describe('Symbol.iterator', () => {
    it('is iterable', () => {
      const q = new IndexedQueue([1, 2, 3])
      const collected: number[] = []
      for (const item of q) {
        collected.push(item)
      }
      expect(collected).toEqual([1, 2, 3])
    })

    it('works with spread operator', () => {
      const q = new IndexedQueue([1, 2, 3])
      expect([...q]).toEqual([1, 2, 3])
    })

    it('works with Array.from', () => {
      const q = new IndexedQueue([1, 2, 3])
      expect(Array.from(q)).toEqual([1, 2, 3])
    })

    it('works with destructuring', () => {
      const q = new IndexedQueue([1, 2, 3])
      const [a, b, c] = q
      expect(a).toBe(1)
      expect(b).toBe(2)
      expect(c).toBe(3)
    })

    it('empty queue yields nothing', () => {
      const q = new IndexedQueue<number>()
      const items = [...q]
      expect(items).toEqual([])
    })
  })

  describe('static fromArray', () => {
    it('creates queue from array', () => {
      const q = IndexedQueue.fromArray([1, 2, 3])
      expect(q.toArray()).toEqual([1, 2, 3])
    })

    it('creates empty queue from empty array', () => {
      const q = IndexedQueue.fromArray([])
      expect(q.isEmpty()).toBe(true)
    })

    it('preserves type', () => {
      const q = IndexedQueue.fromArray(['a', 'b'])
      expect(q.get(0)).toBe('a')
    })
  })

  describe('DEFAULT_INDEXED_QUEUE_OPTIONS', () => {
    it('has correct initial capacity', () => {
      expect(DEFAULT_INDEXED_QUEUE_OPTIONS.initialCapacity).toBe(16)
    })

    it('has correct growth factor', () => {
      expect(DEFAULT_INDEXED_QUEUE_OPTIONS.growthFactor).toBe(2)
    })
  })

  describe('edge cases - single element', () => {
    it('push then pop back', () => {
      const q = new IndexedQueue<number>()
      q.pushBack(42)
      expect(q.popBack()).toBe(42)
      expect(q.isEmpty()).toBe(true)
    })

    it('push then pop front', () => {
      const q = new IndexedQueue<number>()
      q.pushBack(42)
      expect(q.popFront()).toBe(42)
      expect(q.isEmpty()).toBe(true)
    })

    it('push front then pop front', () => {
      const q = new IndexedQueue<number>()
      q.pushFront(42)
      expect(q.popFront()).toBe(42)
      expect(q.isEmpty()).toBe(true)
    })

    it('push front then pop back', () => {
      const q = new IndexedQueue<number>()
      q.pushFront(42)
      expect(q.popBack()).toBe(42)
      expect(q.isEmpty()).toBe(true)
    })

    it('get single element at index 0', () => {
      const q = new IndexedQueue([99])
      expect(q.get(0)).toBe(99)
    })

    it('set single element', () => {
      const q = new IndexedQueue([1])
      q.set(0, 50)
      expect(q.get(0)).toBe(50)
    })
  })

  describe('edge cases - wrap-around', () => {
    it('pushFront causes wrap-around', () => {
      const q = new IndexedQueue<number>()
      for (let i = 0; i < 20; i++) {
        q.pushBack(i)
      }
      for (let i = 0; i < 10; i++) {
        q.popFront()
      }
      q.pushFront(999)
      expect(q.peekFront()).toBe(999)
    })

    it('operations after multiple wraps', () => {
      const q = new IndexedQueue<number>()
      for (let round = 0; round < 5; round++) {
        q.pushBack(round * 10)
        q.pushBack(round * 10 + 1)
        q.popFront()
      }
      expect(q.size()).toBe(5)
    })

    it('get/set work correctly after wrap', () => {
      const q = new IndexedQueue<number>()
      for (let i = 0; i < 20; i++) q.pushBack(i)
      for (let i = 0; i < 15; i++) q.popFront()
      for (let i = 100; i < 110; i++) q.pushBack(i)
      expect(q.get(0)).toBe(15)
      expect(q.get(4)).toBe(19)
      expect(q.get(5)).toBe(100)
    })
  })

  describe('automatic resizing', () => {
    it('grows when capacity exceeded via pushBack', () => {
      const q = new IndexedQueue<number>()
      for (let i = 0; i < 100; i++) {
        q.pushBack(i)
      }
      expect(q.size()).toBe(100)
      expect(q.get(0)).toBe(0)
      expect(q.get(99)).toBe(99)
    })

    it('grows when capacity exceeded via pushFront', () => {
      const q = new IndexedQueue<number>()
      for (let i = 0; i < 100; i++) {
        q.pushFront(i)
      }
      expect(q.size()).toBe(100)
      expect(q.get(0)).toBe(99)
      expect(q.get(99)).toBe(0)
    })

    it('maintains correct order after resize', () => {
      const q = new IndexedQueue<number>()
      for (let i = 0; i < 50; i++) q.pushBack(i)
      const arr = q.toArray()
      for (let i = 0; i < 50; i++) {
        expect(arr[i]).toBe(i)
      }
    })

    it('resizes from initial items larger than capacity', () => {
      const items = Array.from({ length: 100 }, (_, i) => i)
      const q = new IndexedQueue(items)
      expect(q.size()).toBe(100)
      expect(q.get(0)).toBe(0)
      expect(q.get(99)).toBe(99)
    })
  })

  describe('interleaved operations', () => {
    it('push back, pop front alternating', () => {
      const q = new IndexedQueue<number>()
      q.pushBack(1)
      expect(q.popFront()).toBe(1)
      q.pushBack(2)
      expect(q.popFront()).toBe(2)
      expect(q.isEmpty()).toBe(true)
    })

    it('push front, pop back alternating', () => {
      const q = new IndexedQueue<number>()
      q.pushFront(1)
      expect(q.popBack()).toBe(1)
      q.pushFront(2)
      expect(q.popBack()).toBe(2)
      expect(q.isEmpty()).toBe(true)
    })

    it('mixed push and pop from both ends', () => {
      const q = new IndexedQueue<number>()
      q.pushBack(1)
      q.pushFront(2)
      q.pushBack(3)
      q.pushFront(4)
      expect(q.toArray()).toEqual([4, 2, 1, 3])
      expect(q.popFront()).toBe(4)
      expect(q.popBack()).toBe(3)
      expect(q.toArray()).toEqual([2, 1])
    })

    it('complex interleaved sequence', () => {
      const q = new IndexedQueue<number>()
      q.pushBack(10)
      q.pushBack(20)
      q.pushFront(5)
      expect(q.toArray()).toEqual([5, 10, 20])
      q.popBack()
      expect(q.toArray()).toEqual([5, 10])
      q.pushBack(30)
      q.pushFront(1)
      expect(q.toArray()).toEqual([1, 5, 10, 30])
      q.set(1, 99)
      expect(q.toArray()).toEqual([1, 99, 10, 30])
    })

    it('push pop reuse pattern', () => {
      const q = new IndexedQueue<number>()
      for (let i = 0; i < 5; i++) {
        q.pushBack(i)
        q.popFront()
      }
      expect(q.isEmpty()).toBe(true)
      q.pushBack(42)
      expect(q.peekFront()).toBe(42)
    })
  })

  describe('large queues', () => {
    it('handles 1000 pushBacks', () => {
      const q = new IndexedQueue<number>()
      for (let i = 0; i < 1000; i++) q.pushBack(i)
      expect(q.size()).toBe(1000)
      expect(q.get(0)).toBe(0)
      expect(q.get(999)).toBe(999)
    })

    it('handles 1000 pushFronts', () => {
      const q = new IndexedQueue<number>()
      for (let i = 0; i < 1000; i++) q.pushFront(i)
      expect(q.size()).toBe(1000)
      expect(q.get(0)).toBe(999)
      expect(q.get(999)).toBe(0)
    })

    it('handles 1000 popFronts', () => {
      const q = new IndexedQueue<number>()
      for (let i = 0; i < 1000; i++) q.pushBack(i)
      for (let i = 0; i < 1000; i++) {
        expect(q.popFront()).toBe(i)
      }
      expect(q.isEmpty()).toBe(true)
    })

    it('handles 1000 popBacks', () => {
      const q = new IndexedQueue<number>()
      for (let i = 0; i < 1000; i++) q.pushBack(i)
      for (let i = 999; i >= 0; i--) {
        expect(q.popBack()).toBe(i)
      }
      expect(q.isEmpty()).toBe(true)
    })

    it('forEach over 1000 elements', () => {
      const q = new IndexedQueue<number>()
      for (let i = 0; i < 1000; i++) q.pushBack(i)
      let sum = 0
      q.forEach((v) => (sum += v))
      expect(sum).toBe(499500)
    })

    it('iterator over 1000 elements', () => {
      const q = new IndexedQueue<number>()
      for (let i = 0; i < 1000; i++) q.pushBack(i)
      let sum = 0
      for (const v of q) sum += v
      expect(sum).toBe(499500)
    })

    it('indexOf on large queue', () => {
      const q = new IndexedQueue<number>()
      for (let i = 0; i < 1000; i++) q.pushBack(i)
      expect(q.indexOf(0)).toBe(0)
      expect(q.indexOf(500)).toBe(500)
      expect(q.indexOf(999)).toBe(999)
      expect(q.indexOf(1000)).toBe(-1)
    })

    it('slice on large queue', () => {
      const q = new IndexedQueue<number>()
      for (let i = 0; i < 1000; i++) q.pushBack(i)
      const s = q.slice(100, 110)
      expect(s).toEqual([100, 101, 102, 103, 104, 105, 106, 107, 108, 109])
    })
  })

  describe('combined operations', () => {
    it('clear and reuse', () => {
      const q = new IndexedQueue([1, 2, 3])
      q.clear()
      q.pushBack(10)
      q.pushBack(20)
      expect(q.toArray()).toEqual([10, 20])
    })

    it('clone after modifications', () => {
      const q = new IndexedQueue([1, 2, 3])
      q.popFront()
      const c = q.clone()
      expect(c.toArray()).toEqual([2, 3])
    })

    it('fromArray then modify', () => {
      const q = IndexedQueue.fromArray([1, 2, 3])
      q.pushBack(4)
      q.popFront()
      expect(q.toArray()).toEqual([2, 3, 4])
    })

    it('forEach with get', () => {
      const q = new IndexedQueue([10, 20, 30])
      const items: number[] = []
      q.forEach((_item, idx) => items.push(q.get(idx)))
      expect(items).toEqual([10, 20, 30])
    })

    it('multiple clones', () => {
      const q = new IndexedQueue([1, 2, 3])
      const c1 = q.clone()
      const c2 = q.clone()
      c1.pushBack(4)
      c2.pushFront(0)
      expect(q.toArray()).toEqual([1, 2, 3])
      expect(c1.toArray()).toEqual([1, 2, 3, 4])
      expect(c2.toArray()).toEqual([0, 1, 2, 3])
    })

    it('set then indexOf', () => {
      const q = new IndexedQueue([1, 2, 3])
      q.set(1, 99)
      expect(q.indexOf(2)).toBe(-1)
      expect(q.indexOf(99)).toBe(1)
    })

    it('set then includes', () => {
      const q = new IndexedQueue([1, 2, 3])
      q.set(1, 99)
      expect(q.includes(2)).toBe(false)
      expect(q.includes(99)).toBe(true)
    })

    it('slice after front pops', () => {
      const q = new IndexedQueue([1, 2, 3, 4, 5])
      q.popFront()
      q.popFront()
      expect(q.slice()).toEqual([3, 4, 5])
    })

    it('toArray after interleaved ops', () => {
      const q = new IndexedQueue([1, 2, 3, 4, 5])
      q.popFront()
      q.pushBack(6)
      q.popBack()
      q.pushFront(0)
      expect(q.toArray()).toEqual([0, 2, 3, 4, 5])
    })
  })

  describe('type safety', () => {
    it('works with generic string type', () => {
      const q = new IndexedQueue<string>()
      q.pushBack('hello')
      expect(q.get(0)).toBe('hello')
    })

    it('works with generic object type', () => {
      interface Item {
        id: number
        name: string
      }
      const q = new IndexedQueue<Item>()
      q.pushBack({ id: 1, name: 'a' })
      expect(q.get(0).name).toBe('a')
    })

    it('works with number type', () => {
      const q = new IndexedQueue<number>()
      q.pushBack(42)
      const val: number = q.get(0)
      expect(val).toBe(42)
    })
  })
})
