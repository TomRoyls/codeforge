import { Deque, DEFAULT_DEQUE_OPTIONS } from '../src/core/deque/deque.js'
import type { DequeOptions } from '../src/core/deque/deque.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('Deque', () => {
  describe('constructor', () => {
    it('creates an empty deque with default options', () => {
      const dq = new Deque()
      expect(dq.size()).toBe(0)
      expect(dq.isEmpty()).toBe(true)
    })

    it('creates a deque with maxSize option', () => {
      const dq = new Deque<number>({ maxSize: 3 })
      expect(dq.size()).toBe(0)
    })

    it('defaults maxSize to 0 (unbounded)', () => {
      const dq = new Deque<number>()
      for (let i = 0; i < 1000; i++) {
        dq.pushBack(i)
      }
      expect(dq.size()).toBe(1000)
    })

    it('accepts partial options merging with defaults', () => {
      const dq = new Deque<number>({ maxSize: 5 })
      expect(dq.size()).toBe(0)
    })
  })

  // ─── DEFAULT_DEQUE_OPTIONS ──────────────────────────────────────────

  describe('DEFAULT_DEQUE_OPTIONS', () => {
    it('has maxSize of 0', () => {
      expect(DEFAULT_DEQUE_OPTIONS.maxSize).toBe(0)
    })
  })

  // ─── pushFront ─────────────────────────────────────────────────────

  describe('pushFront', () => {
    it('adds an element to the front of an empty deque', () => {
      const dq = new Deque<number>()
      dq.pushFront(1)
      expect(dq.size()).toBe(1)
      expect(dq.peekFront()).toBe(1)
      expect(dq.peekBack()).toBe(1)
    })

    it('adds elements to the front, shifting existing elements', () => {
      const dq = new Deque<number>()
      dq.pushFront(2)
      dq.pushFront(1)
      expect(dq.toArray()).toEqual([1, 2])
    })

    it('evicts from back when maxSize is exceeded', () => {
      const dq = new Deque<number>({ maxSize: 2 })
      dq.pushFront(1)
      dq.pushFront(2)
      dq.pushFront(3)
      expect(dq.toArray()).toEqual([3, 2])
      expect(dq.size()).toBe(2)
    })

    it('handles string values', () => {
      const dq = new Deque<string>()
      dq.pushFront('b')
      dq.pushFront('a')
      expect(dq.toArray()).toEqual(['a', 'b'])
    })
  })

  // ─── pushBack ──────────────────────────────────────────────────────

  describe('pushBack', () => {
    it('adds an element to the back of an empty deque', () => {
      const dq = new Deque<number>()
      dq.pushBack(1)
      expect(dq.size()).toBe(1)
      expect(dq.peekFront()).toBe(1)
      expect(dq.peekBack()).toBe(1)
    })

    it('adds elements to the back in order', () => {
      const dq = new Deque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })

    it('evicts from front when maxSize is exceeded', () => {
      const dq = new Deque<number>({ maxSize: 2 })
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      expect(dq.toArray()).toEqual([2, 3])
      expect(dq.size()).toBe(2)
    })
  })

  // ─── popFront ──────────────────────────────────────────────────────

  describe('popFront', () => {
    it('returns undefined when deque is empty', () => {
      const dq = new Deque<number>()
      expect(dq.popFront()).toBeUndefined()
    })

    it('removes and returns the front element', () => {
      const dq = new Deque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      expect(dq.popFront()).toBe(1)
      expect(dq.toArray()).toEqual([2, 3])
    })

    it('updates size correctly', () => {
      const dq = new Deque<number>()
      dq.pushBack(10)
      dq.pushBack(20)
      dq.popFront()
      expect(dq.size()).toBe(1)
    })

    it('handles popping the last element (deque becomes empty)', () => {
      const dq = new Deque<number>()
      dq.pushBack(42)
      expect(dq.popFront()).toBe(42)
      expect(dq.size()).toBe(0)
      expect(dq.isEmpty()).toBe(true)
      expect(dq.peekFront()).toBeUndefined()
      expect(dq.peekBack()).toBeUndefined()
    })
  })

  // ─── popBack ───────────────────────────────────────────────────────

  describe('popBack', () => {
    it('returns undefined when deque is empty', () => {
      const dq = new Deque<number>()
      expect(dq.popBack()).toBeUndefined()
    })

    it('removes and returns the back element', () => {
      const dq = new Deque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      expect(dq.popBack()).toBe(3)
      expect(dq.toArray()).toEqual([1, 2])
    })

    it('updates size correctly', () => {
      const dq = new Deque<number>()
      dq.pushBack(10)
      dq.pushBack(20)
      dq.popBack()
      expect(dq.size()).toBe(1)
    })

    it('handles popping the last element (deque becomes empty)', () => {
      const dq = new Deque<number>()
      dq.pushBack(99)
      expect(dq.popBack()).toBe(99)
      expect(dq.size()).toBe(0)
      expect(dq.isEmpty()).toBe(true)
    })
  })

  // ─── peekFront ─────────────────────────────────────────────────────

  describe('peekFront', () => {
    it('returns undefined when deque is empty', () => {
      const dq = new Deque<number>()
      expect(dq.peekFront()).toBeUndefined()
    })

    it('returns the front element without removing it', () => {
      const dq = new Deque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      expect(dq.peekFront()).toBe(1)
      expect(dq.size()).toBe(2)
    })
  })

  // ─── peekBack ──────────────────────────────────────────────────────

  describe('peekBack', () => {
    it('returns undefined when deque is empty', () => {
      const dq = new Deque<number>()
      expect(dq.peekBack()).toBeUndefined()
    })

    it('returns the back element without removing it', () => {
      const dq = new Deque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      expect(dq.peekBack()).toBe(2)
      expect(dq.size()).toBe(2)
    })
  })

  // ─── size / isEmpty ────────────────────────────────────────────────

  describe('size and isEmpty', () => {
    it('size returns 0 for empty deque', () => {
      const dq = new Deque<number>()
      expect(dq.size()).toBe(0)
    })

    it('isEmpty returns true for empty deque', () => {
      const dq = new Deque<number>()
      expect(dq.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after adding elements', () => {
      const dq = new Deque<number>()
      dq.pushBack(1)
      expect(dq.isEmpty()).toBe(false)
    })

    it('size tracks correctly through mixed operations', () => {
      const dq = new Deque<number>()
      dq.pushBack(1)
      dq.pushFront(2)
      expect(dq.size()).toBe(2)
      dq.popFront()
      expect(dq.size()).toBe(1)
      dq.pushBack(3)
      expect(dq.size()).toBe(2)
      dq.popBack()
      dq.popFront()
      expect(dq.size()).toBe(0)
    })
  })

  // ─── clear ─────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all elements', () => {
      const dq = new Deque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      dq.clear()
      expect(dq.size()).toBe(0)
      expect(dq.isEmpty()).toBe(true)
    })

    it('allows reuse after clearing', () => {
      const dq = new Deque<number>()
      dq.pushBack(1)
      dq.clear()
      dq.pushBack(2)
      expect(dq.size()).toBe(1)
      expect(dq.peekFront()).toBe(2)
    })

    it('clearing an already empty deque is safe', () => {
      const dq = new Deque<number>()
      dq.clear()
      expect(dq.size()).toBe(0)
      expect(dq.isEmpty()).toBe(true)
    })
  })

  // ─── toArray ───────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns empty array for empty deque', () => {
      const dq = new Deque<number>()
      expect(dq.toArray()).toEqual([])
    })

    it('returns elements in order from front to back', () => {
      const dq = new Deque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })

    it('reflects front-push ordering correctly', () => {
      const dq = new Deque<number>()
      dq.pushFront(3)
      dq.pushFront(2)
      dq.pushFront(1)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })
  })

  // ─── fromArray ─────────────────────────────────────────────────────

  describe('fromArray', () => {
    it('adds all elements from an array to the back', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2, 3])
      expect(dq.toArray()).toEqual([1, 2, 3])
      expect(dq.size()).toBe(3)
    })

    it('appends to existing elements', () => {
      const dq = new Deque<number>()
      dq.pushBack(0)
      dq.fromArray([1, 2])
      expect(dq.toArray()).toEqual([0, 1, 2])
    })

    it('handles empty array', () => {
      const dq = new Deque<number>()
      dq.fromArray([])
      expect(dq.size()).toBe(0)
    })

    it('respects maxSize when filling from array', () => {
      const dq = new Deque<number>({ maxSize: 2 })
      dq.fromArray([1, 2, 3, 4])
      // pushBack evicts from front when full
      expect(dq.toArray()).toEqual([3, 4])
    })
  })

  // ─── forEach ───────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all elements in order', () => {
      const dq = new Deque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      const result: number[] = []
      dq.forEach((value, index) => {
        result.push(value)
        expect(index).toBe(result.length - 1)
      })
      expect(result).toEqual([1, 2, 3])
    })

    it('does not iterate on empty deque', () => {
      const dq = new Deque<number>()
      let count = 0
      dq.forEach(() => { count++ })
      expect(count).toBe(0)
    })

    it('provides correct indices', () => {
      const dq = new Deque<string>()
      dq.fromArray(['a', 'b', 'c'])
      const indices: number[] = []
      dq.forEach((_value, index) => { indices.push(index) })
      expect(indices).toEqual([0, 1, 2])
    })
  })

  // ─── get ───────────────────────────────────────────────────────────

  describe('get', () => {
    it('returns the element at the given index', () => {
      const dq = new Deque<number>()
      dq.fromArray([10, 20, 30])
      expect(dq.get(0)).toBe(10)
      expect(dq.get(1)).toBe(20)
      expect(dq.get(2)).toBe(30)
    })

    it('returns undefined for out-of-bounds index', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2])
      expect(dq.get(-1)).toBeUndefined()
      expect(dq.get(2)).toBeUndefined()
      expect(dq.get(100)).toBeUndefined()
    })

    it('returns undefined for empty deque', () => {
      const dq = new Deque<number>()
      expect(dq.get(0)).toBeUndefined()
    })
  })

  // ─── set ───────────────────────────────────────────────────────────

  describe('set', () => {
    it('updates the value at the given index', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2, 3])
      expect(dq.set(1, 99)).toBe(true)
      expect(dq.get(1)).toBe(99)
    })

    it('returns false for out-of-bounds index', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2])
      expect(dq.set(-1, 0)).toBe(false)
      expect(dq.set(2, 0)).toBe(false)
    })

    it('does not modify size', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2, 3])
      dq.set(0, 100)
      expect(dq.size()).toBe(3)
    })
  })

  // ─── insertAt ──────────────────────────────────────────────────────

  describe('insertAt', () => {
    it('inserts at index 0 via pushFront', () => {
      const dq = new Deque<number>()
      dq.fromArray([2, 3])
      dq.insertAt(0, 1)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })

    it('inserts at the end via pushBack when index >= size', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2])
      dq.insertAt(10, 3)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })

    it('inserts in the middle', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 3])
      dq.insertAt(1, 2)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })

    it('inserts at index <= 0 via pushFront', () => {
      const dq = new Deque<number>()
      dq.fromArray([2, 3])
      dq.insertAt(-5, 1)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })

    it('respects maxSize eviction on middle insert', () => {
      const dq = new Deque<number>({ maxSize: 3 })
      dq.fromArray([1, 2, 3])
      dq.insertAt(1, 99)
      expect(dq.toArray()).toEqual([1, 99, 2])
    })
  })

  // ─── removeAt ──────────────────────────────────────────────────────

  describe('removeAt', () => {
    it('returns undefined for out-of-bounds index', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2])
      expect(dq.removeAt(-1)).toBeUndefined()
      expect(dq.removeAt(2)).toBeUndefined()
    })

    it('removes from front (index 0)', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2, 3])
      expect(dq.removeAt(0)).toBe(1)
      expect(dq.toArray()).toEqual([2, 3])
    })

    it('removes from back (last index)', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2, 3])
      expect(dq.removeAt(2)).toBe(3)
      expect(dq.toArray()).toEqual([1, 2])
    })

    it('removes from the middle', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2, 3, 4])
      expect(dq.removeAt(1)).toBe(2)
      expect(dq.toArray()).toEqual([1, 3, 4])
    })

    it('updates size correctly', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2, 3])
      dq.removeAt(1)
      expect(dq.size()).toBe(2)
    })
  })

  // ─── indexOf / contains ────────────────────────────────────────────

  describe('indexOf and contains', () => {
    it('indexOf returns the first index of a value', () => {
      const dq = new Deque<number>()
      dq.fromArray([10, 20, 30])
      expect(dq.indexOf(20)).toBe(1)
    })

    it('indexOf returns -1 for missing value', () => {
      const dq = new Deque<number>()
      dq.fromArray([10, 20, 30])
      expect(dq.indexOf(99)).toBe(-1)
    })

    it('indexOf returns first occurrence of duplicates', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2, 2, 3])
      expect(dq.indexOf(2)).toBe(1)
    })

    it('indexOf returns -1 for empty deque', () => {
      const dq = new Deque<number>()
      expect(dq.indexOf(1)).toBe(-1)
    })

    it('contains returns true for existing value', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2, 3])
      expect(dq.contains(2)).toBe(true)
    })

    it('contains returns false for missing value', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2, 3])
      expect(dq.contains(99)).toBe(false)
    })

    it('contains returns false for empty deque', () => {
      const dq = new Deque<number>()
      expect(dq.contains(1)).toBe(false)
    })

    it('uses strict equality for comparison', () => {
      const dq = new Deque<string>()
      dq.fromArray(['hello', 'world'])
      expect(dq.contains('hello')).toBe(true)
      expect(dq.contains('Hello')).toBe(false)
    })
  })

  // ─── reverse ───────────────────────────────────────────────────────

  describe('reverse', () => {
    it('reverses the order of elements', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2, 3])
      dq.reverse()
      expect(dq.toArray()).toEqual([3, 2, 1])
    })

    it('handles empty deque', () => {
      const dq = new Deque<number>()
      dq.reverse()
      expect(dq.toArray()).toEqual([])
    })

    it('handles single-element deque', () => {
      const dq = new Deque<number>()
      dq.pushBack(42)
      dq.reverse()
      expect(dq.toArray()).toEqual([42])
    })

    it('handles two-element deque', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2])
      dq.reverse()
      expect(dq.toArray()).toEqual([2, 1])
    })

    it('updates peekFront and peekBack after reverse', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2, 3])
      dq.reverse()
      expect(dq.peekFront()).toBe(3)
      expect(dq.peekBack()).toBe(1)
    })
  })

  // ─── rotate ────────────────────────────────────────────────────────

  describe('rotate', () => {
    it('rotates forward by n positions', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2, 3, 4])
      dq.rotate(1)
      expect(dq.toArray()).toEqual([2, 3, 4, 1])
    })

    it('rotates by multiple positions', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2, 3, 4])
      dq.rotate(2)
      expect(dq.toArray()).toEqual([3, 4, 1, 2])
    })

    it('handles negative rotation (backward)', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2, 3, 4])
      dq.rotate(-1)
      expect(dq.toArray()).toEqual([4, 1, 2, 3])
    })

    it('no-op when rotating by 0', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2, 3])
      dq.rotate(0)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })

    it('no-op when rotating by size', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2, 3])
      dq.rotate(3)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })

    it('no-op on empty deque', () => {
      const dq = new Deque<number>()
      dq.rotate(5)
      expect(dq.size()).toBe(0)
    })

    it('no-op on single-element deque', () => {
      const dq = new Deque<number>()
      dq.pushBack(42)
      dq.rotate(10)
      expect(dq.toArray()).toEqual([42])
    })

    it('handles rotation larger than size (wraps around)', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2, 3])
      dq.rotate(5) // 5 % 3 = 2
      expect(dq.toArray()).toEqual([3, 1, 2])
    })
  })

  // ─── maxSize eviction ──────────────────────────────────────────────

  describe('maxSize eviction', () => {
    it('pushFront evicts from back', () => {
      const dq = new Deque<number>({ maxSize: 3 })
      dq.fromArray([1, 2, 3])
      dq.pushFront(0)
      expect(dq.toArray()).toEqual([0, 1, 2])
    })

    it('pushBack evicts from front', () => {
      const dq = new Deque<number>({ maxSize: 3 })
      dq.fromArray([1, 2, 3])
      dq.pushBack(4)
      expect(dq.toArray()).toEqual([2, 3, 4])
    })

    it('maintains correct size after eviction', () => {
      const dq = new Deque<number>({ maxSize: 2 })
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      expect(dq.size()).toBe(2)
    })

    it('maxSize of 1 keeps only the last element (pushBack)', () => {
      const dq = new Deque<number>({ maxSize: 1 })
      dq.pushBack(1)
      dq.pushBack(2)
      expect(dq.toArray()).toEqual([2])
    })

    it('maxSize of 1 keeps only the last element (pushFront)', () => {
      const dq = new Deque<number>({ maxSize: 1 })
      dq.pushFront(1)
      dq.pushFront(2)
      expect(dq.toArray()).toEqual([2])
    })
  })

  // ─── FIFO pattern ──────────────────────────────────────────────────

  describe('FIFO pattern (queue behavior)', () => {
    it('pushBack + popFront behaves as a queue', () => {
      const dq = new Deque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      expect(dq.popFront()).toBe(1)
      expect(dq.popFront()).toBe(2)
      expect(dq.popFront()).toBe(3)
      expect(dq.isEmpty()).toBe(true)
    })
  })

  // ─── LIFO pattern ──────────────────────────────────────────────────

  describe('LIFO pattern (stack behavior)', () => {
    it('pushBack + popBack behaves as a stack', () => {
      const dq = new Deque<number>()
      dq.pushBack(1)
      dq.pushBack(2)
      dq.pushBack(3)
      expect(dq.popBack()).toBe(3)
      expect(dq.popBack()).toBe(2)
      expect(dq.popBack()).toBe(1)
      expect(dq.isEmpty()).toBe(true)
    })

    it('pushFront + popFront behaves as a stack', () => {
      const dq = new Deque<number>()
      dq.pushFront(1)
      dq.pushFront(2)
      dq.pushFront(3)
      expect(dq.popFront()).toBe(3)
      expect(dq.popFront()).toBe(2)
      expect(dq.popFront()).toBe(1)
      expect(dq.isEmpty()).toBe(true)
    })
  })

  // ─── Interleaved push/pop ──────────────────────────────────────────

  describe('interleaved push and pop', () => {
    it('handles alternating pushFront/popBack', () => {
      const dq = new Deque<number>()
      dq.pushFront(3)
      expect(dq.popBack()).toBe(3)
      dq.pushFront(2)
      dq.pushFront(1)
      expect(dq.popBack()).toBe(2)
      expect(dq.toArray()).toEqual([1])
    })

    it('handles alternating pushBack/popFront', () => {
      const dq = new Deque<number>()
      dq.pushBack(1)
      expect(dq.popFront()).toBe(1)
      dq.pushBack(2)
      dq.pushBack(3)
      expect(dq.popFront()).toBe(2)
      expect(dq.toArray()).toEqual([3])
    })

    it('handles push and pop from both ends', () => {
      const dq = new Deque<number>()
      dq.pushFront(2)
      dq.pushBack(3)
      dq.pushFront(1)
      dq.pushBack(4)
      expect(dq.toArray()).toEqual([1, 2, 3, 4])
      expect(dq.popFront()).toBe(1)
      expect(dq.popBack()).toBe(4)
      expect(dq.toArray()).toEqual([2, 3])
    })
  })

  // ─── Edge cases ────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles null values', () => {
      const dq = new Deque<null>()
      dq.pushBack(null)
      expect(dq.peekFront()).toBeNull()
      expect(dq.size()).toBe(1)
    })

    it('handles undefined values', () => {
      const dq = new Deque<undefined>()
      dq.pushBack(undefined)
      expect(dq.peekFront()).toBeUndefined()
      expect(dq.size()).toBe(1)
    })

    it('handles object values', () => {
      const dq = new Deque<{ id: number }>()
      dq.pushBack({ id: 1 })
      dq.pushBack({ id: 2 })
      expect(dq.get(0)?.id).toBe(1)
      expect(dq.get(1)?.id).toBe(2)
    })

    it('handles boolean values', () => {
      const dq = new Deque<boolean>()
      dq.pushBack(true)
      dq.pushBack(false)
      expect(dq.toArray()).toEqual([true, false])
    })

    it('multiple pops on empty deque return undefined', () => {
      const dq = new Deque<number>()
      expect(dq.popFront()).toBeUndefined()
      expect(dq.popFront()).toBeUndefined()
      expect(dq.popBack()).toBeUndefined()
      expect(dq.popBack()).toBeUndefined()
    })

    it('peek operations on empty deque do not modify state', () => {
      const dq = new Deque<number>()
      dq.peekFront()
      dq.peekBack()
      expect(dq.size()).toBe(0)
      expect(dq.isEmpty()).toBe(true)
    })

    it('handles large number of elements', () => {
      const dq = new Deque<number>()
      for (let i = 0; i < 10000; i++) {
        dq.pushBack(i)
      }
      expect(dq.size()).toBe(10000)
      expect(dq.peekFront()).toBe(0)
      expect(dq.peekBack()).toBe(9999)
    })

    it('get uses optimized path for back-half indices', () => {
      const dq = new Deque<number>()
      dq.fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
      expect(dq.get(8)).toBe(8)
      expect(dq.get(9)).toBe(9)
    })

    it('deque with maxSize works after clear and refill', () => {
      const dq = new Deque<number>({ maxSize: 2 })
      dq.fromArray([1, 2])
      dq.clear()
      dq.fromArray([3, 4, 5])
      expect(dq.toArray()).toEqual([4, 5])
    })

    it('reverse then pushBack works correctly', () => {
      const dq = new Deque<number>()
      dq.fromArray([1, 2, 3])
      dq.reverse()
      dq.pushBack(0)
      expect(dq.toArray()).toEqual([3, 2, 1, 0])
    })

    it('forEach on a deque with one element', () => {
      const dq = new Deque<number>()
      dq.pushBack(42)
      const result: number[] = []
      dq.forEach((v) => result.push(v))
      expect(result).toEqual([42])
    })
  })
})
