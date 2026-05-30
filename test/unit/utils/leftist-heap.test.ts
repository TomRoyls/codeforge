import { describe, expect, it } from 'vitest'
import { LeftistHeap } from '../../../src/utils/leftist-heap.js'

describe('LeftistHeap', () => {
  describe('constructor', () => {
    it('creates empty heap', () => {
      const heap = new LeftistHeap()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('creates heap with custom comparator', () => {
      const heap = new LeftistHeap<number>({
        comparator: (a, b) => b - a
      })
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
    })

    it('creates heap for strings', () => {
      const heap = new LeftistHeap<string>({
        comparator: (a, b) => a.localeCompare(b)
      })
      heap.insert('c')
      heap.insert('a')
      heap.insert('b')
      expect(heap.extractMin()).toBe('a')
    })

    it('creates heap for objects', () => {
      const heap = new LeftistHeap<{ value: number }>({
        comparator: (a, b) => a.value - b.value
      })
      heap.insert({ value: 3 })
      heap.insert({ value: 1 })
      heap.insert({ value: 2 })
      expect(heap.extractMin()?.value).toBe(1)
    })
  })

  describe('insert', () => {
    it('inserts single element', () => {
      const heap = new LeftistHeap()
      heap.insert(5)
      expect(heap.size).toBe(1)
      expect(heap.isEmpty()).toBe(false)
      expect(heap.peek()).toBe(5)
    })

    it('inserts multiple elements', () => {
      const heap = new LeftistHeap()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('inserts duplicate values', () => {
      const heap = new LeftistHeap()
      heap.insert(1)
      heap.insert(1)
      heap.insert(1)
      expect(heap.size).toBe(3)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(1)
    })

    it('maintains min at top', () => {
      const heap = new LeftistHeap()
      heap.insert(10)
      heap.insert(5)
      heap.insert(15)
      heap.insert(1)
      expect(heap.peek()).toBe(1)
    })

    it('handles negative numbers', () => {
      const heap = new LeftistHeap()
      heap.insert(-5)
      heap.insert(-1)
      heap.insert(-10)
      expect(heap.peek()).toBe(-10)
    })

    it('inserts zero', () => {
      const heap = new LeftistHeap()
      heap.insert(5)
      heap.insert(0)
      heap.insert(-5)
      expect(heap.peek()).toBe(-5)
    })
  })

  describe('extractMin', () => {
    it('extracts min from single element', () => {
      const heap = new LeftistHeap()
      heap.insert(5)
      const min = heap.extractMin()
      expect(min).toBe(5)
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('extracts in sorted order', () => {
      const heap = new LeftistHeap()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(3)
    })

    it('returns undefined for empty heap', () => {
      const heap = new LeftistHeap()
      expect(heap.extractMin()).toBe(undefined)
    })

    it('extracts all elements', () => {
      const heap = new LeftistHeap()
      heap.insert(5)
      heap.insert(3)
      heap.insert(1)
      heap.insert(4)
      heap.insert(2)
      const result: number[] = []
      while (!heap.isEmpty()) {
        const val = heap.extractMin()
        if (val !== undefined) result.push(val)
      }
      expect(result).toEqual([1, 2, 3, 4, 5])
    })

    it('handles duplicates', () => {
      const heap = new LeftistHeap()
      heap.insert(2)
      heap.insert(1)
      heap.insert(1)
      heap.insert(3)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(3)
    })

    it('maintains heap property after extraction', () => {
      const heap = new LeftistHeap()
      for (let i = 10; i >= 1; i--) {
        heap.insert(i)
      }
      heap.extractMin()
      expect(heap.peek()).toBe(2)
    })
  })

  describe('peek', () => {
    it('returns min without removing', () => {
      const heap = new LeftistHeap()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(3)
    })

    it('returns undefined for empty heap', () => {
      const heap = new LeftistHeap()
      expect(heap.peek()).toBe(undefined)
    })

    it('returns same value on repeated peek', () => {
      const heap = new LeftistHeap()
      heap.insert(5)
      heap.insert(1)
      expect(heap.peek()).toBe(1)
      expect(heap.peek()).toBe(1)
      expect(heap.peek()).toBe(1)
    })

    it('updates peek after insert', () => {
      const heap = new LeftistHeap()
      heap.insert(5)
      expect(heap.peek()).toBe(5)
      heap.insert(1)
      expect(heap.peek()).toBe(1)
    })

    it('updates peek after extract', () => {
      const heap = new LeftistHeap()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      expect(heap.peek()).toBe(2)
    })
  })

  describe('merge', () => {
    it('merges two non-empty heaps', () => {
      const heap1 = new LeftistHeap()
      heap1.insert(1)
      heap1.insert(3)

      const heap2 = new LeftistHeap()
      heap2.insert(2)
      heap2.insert(4)

      heap1.merge(heap2)

      expect(heap1.size).toBe(4)
      expect(heap1.extractMin()).toBe(1)
      expect(heap1.extractMin()).toBe(2)
      expect(heap1.extractMin()).toBe(3)
      expect(heap1.extractMin()).toBe(4)
    })

    it('merges heap with empty heap', () => {
      const heap1 = new LeftistHeap()
      heap1.insert(1)
      heap1.insert(2)

      const heap2 = new LeftistHeap()

      heap1.merge(heap2)

      expect(heap1.size).toBe(2)
      expect(heap1.extractMin()).toBe(1)
      expect(heap1.extractMin()).toBe(2)
    })

    it('merges empty heap with non-empty heap', () => {
      const heap1 = new LeftistHeap()
      const heap2 = new LeftistHeap()
      heap2.insert(1)
      heap2.insert(2)

      heap1.merge(heap2)

      expect(heap1.size).toBe(2)
    })

    it('clears source heap after merge', () => {
      const heap1 = new LeftistHeap()
      heap1.insert(1)

      const heap2 = new LeftistHeap()
      heap2.insert(2)

      heap1.merge(heap2)

      expect(heap2.size).toBe(0)
      expect(heap2.isEmpty()).toBe(true)
      expect(heap2.peek()).toBe(undefined)
    })

    it('merges heaps with custom comparator', () => {
      const heap1 = new LeftistHeap<number>({
        comparator: (a, b) => b - a
      })
      heap1.insert(3)
      heap1.insert(1)

      const heap2 = new LeftistHeap<number>({
        comparator: (a, b) => b - a
      })
      heap2.insert(2)
      heap2.insert(4)

      heap1.merge(heap2)

      expect(heap1.extractMin()).toBe(4)
      expect(heap1.extractMin()).toBe(3)
      expect(heap1.extractMin()).toBe(2)
      expect(heap1.extractMin()).toBe(1)
    })

    it('handles duplicate values across heaps', () => {
      const heap1 = new LeftistHeap()
      heap1.insert(1)
      heap1.insert(2)

      const heap2 = new LeftistHeap()
      heap2.insert(1)
      heap2.insert(2)

      heap1.merge(heap2)

      expect(heap1.size).toBe(4)
      expect(heap1.extractMin()).toBe(1)
      expect(heap1.extractMin()).toBe(1)
      expect(heap1.extractMin()).toBe(2)
      expect(heap1.extractMin()).toBe(2)
    })
  })

  describe('size', () => {
    it('returns 0 for empty heap', () => {
      const heap = new LeftistHeap()
      expect(heap.size).toBe(0)
    })

    it('returns correct size after inserts', () => {
      const heap = new LeftistHeap()
      heap.insert(1)
      expect(heap.size).toBe(1)
      heap.insert(2)
      expect(heap.size).toBe(2)
      heap.insert(3)
      expect(heap.size).toBe(3)
    })

    it('decrements after extract', () => {
      const heap = new LeftistHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extractMin()
      expect(heap.size).toBe(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
    })

    it('resets after clear', () => {
      const heap = new LeftistHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size).toBe(0)
    })

    it('updates after merge', () => {
      const heap1 = new LeftistHeap()
      heap1.insert(1)
      heap1.insert(2)

      const heap2 = new LeftistHeap()
      heap2.insert(3)

      heap1.merge(heap2)

      expect(heap1.size).toBe(3)
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty heap', () => {
      const heap = new LeftistHeap()
      expect(heap.isEmpty()).toBe(true)
    })

    it('returns false after insert', () => {
      const heap = new LeftistHeap()
      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('returns true after extracting all', () => {
      const heap = new LeftistHeap()
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      heap.extractMin()
      expect(heap.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const heap = new LeftistHeap()
      heap.insert(1)
      heap.insert(2)
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
    })

    it('returns true after merge with empty', () => {
      const heap1 = new LeftistHeap()
      const heap2 = new LeftistHeap()
      heap1.merge(heap2)
      expect(heap1.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears all elements', () => {
      const heap = new LeftistHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.peek()).toBe(undefined)
    })

    it('clears empty heap', () => {
      const heap = new LeftistHeap()
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('allows inserts after clear', () => {
      const heap = new LeftistHeap()
      heap.insert(1)
      heap.clear()
      heap.insert(2)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(2)
    })

    it('allows extracts after clear', () => {
      const heap = new LeftistHeap()
      heap.insert(1)
      heap.clear()
      expect(heap.extractMin()).toBe(undefined)
    })
  })

  describe('toArray', () => {
    it('returns sorted array', () => {
      const heap = new LeftistHeap()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      const arr = heap.toArray()
      expect(arr).toEqual([1, 2, 3])
    })

    it('returns empty array for empty heap', () => {
      const heap = new LeftistHeap()
      const arr = heap.toArray()
      expect(arr).toEqual([])
    })

    it('empties the heap after toArray', () => {
      const heap = new LeftistHeap()
      heap.insert(1)
      heap.insert(2)
      heap.toArray()
      expect(heap.isEmpty()).toBe(true)
    })

    it('handles duplicates', () => {
      const heap = new LeftistHeap()
      heap.insert(2)
      heap.insert(1)
      heap.insert(1)
      heap.insert(3)
      const arr = heap.toArray()
      expect(arr).toEqual([1, 1, 2, 3])
    })

    it('handles single element', () => {
      const heap = new LeftistHeap()
      heap.insert(42)
      const arr = heap.toArray()
      expect(arr).toEqual([42])
    })

    it('works with negative numbers', () => {
      const heap = new LeftistHeap()
      heap.insert(-2)
      heap.insert(0)
      heap.insert(-1)
      heap.insert(1)
      const arr = heap.toArray()
      expect(arr).toEqual([-2, -1, 0, 1])
    })

    it('works with strings', () => {
      const heap = new LeftistHeap<string>({
        comparator: (a, b) => a.localeCompare(b)
      })
      heap.insert('c')
      heap.insert('a')
      heap.insert('b')
      const arr = heap.toArray()
      expect(arr).toEqual(['a', 'b', 'c'])
    })
  })

  describe('fromArray', () => {
    it('creates heap from array', () => {
      const heap = LeftistHeap.fromArray([3, 1, 2])
      expect(heap.size).toBe(3)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(3)
    })

    it('creates empty heap from empty array', () => {
      const heap = LeftistHeap.fromArray([])
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('creates heap from single element', () => {
      const heap = LeftistHeap.fromArray([42])
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(42)
    })

    it('creates heap with custom comparator', () => {
      const heap = LeftistHeap.fromArray([1, 2, 3], {
        comparator: (a, b) => b - a
      })
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(1)
    })

    it('handles duplicates in array', () => {
      const heap = LeftistHeap.fromArray([1, 2, 1, 3, 2])
      const arr = heap.toArray()
      expect(arr).toEqual([1, 1, 2, 2, 3])
    })

    it('handles large array', () => {
      const input: number[] = []
      for (let i = 100; i >= 1; i--) {
        input.push(i)
      }
      const heap = LeftistHeap.fromArray(input)
      expect(heap.size).toBe(100)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
    })

    it('creates heap of strings from array', () => {
      const heap = LeftistHeap.fromArray(['c', 'a', 'b'], {
        comparator: (a, b) => a.localeCompare(b)
      })
      const arr = heap.toArray()
      expect(arr).toEqual(['a', 'b', 'c'])
    })

    it('creates heap of objects from array', () => {
      const heap = LeftistHeap.fromArray(
        [{ value: 3 }, { value: 1 }, { value: 2 }],
        {
          comparator: (a, b) => a.value - b.value
        }
      )
      expect(heap.extractMin()?.value).toBe(1)
      expect(heap.extractMin()?.value).toBe(2)
      expect(heap.extractMin()?.value).toBe(3)
    })
  })

  describe('complex operations', () => {
    it('handles many inserts and extracts', () => {
      const heap = new LeftistHeap()
      for (let i = 0; i < 1000; i++) {
        heap.insert(Math.floor(Math.random() * 1000))
      }
      let prev = -1
      while (!heap.isEmpty()) {
        const current = heap.extractMin()
        if (current !== undefined) {
          expect(current).toBeGreaterThanOrEqual(prev)
          prev = current
        }
      }
    })

    it('maintains heap property after many merges', () => {
      const heap1 = new LeftistHeap()
      const heap2 = new LeftistHeap()
      const heap3 = new LeftistHeap()

      for (let i = 0; i < 10; i++) {
        heap1.insert(i * 3)
        heap2.insert(i * 3 + 1)
        heap3.insert(i * 3 + 2)
      }

      heap1.merge(heap2)
      heap1.merge(heap3)

      let prev = -1
      while (!heap1.isEmpty()) {
        const current = heap1.extractMin()
        if (current !== undefined) {
          expect(current).toBeGreaterThan(prev)
          prev = current
        }
      }
    })

    it('handles mixed operations', () => {
      const heap = new LeftistHeap()
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1)
      heap.insert(4)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(4)
      expect(heap.extractMin()).toBe(5)
    })
  })
})