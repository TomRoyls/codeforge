import { describe, it, expect } from 'vitest'
import { IntervalHeap } from '../../../src/utils/interval-heap.js'

describe('IntervalHeap', () => {
  describe('insert and extractMin', () => {
    it('inserts and extracts in order', () => {
      const heap = new IntervalHeap<string>()
      heap.insert(3, 'c')
      heap.insert(1, 'a')
      heap.insert(2, 'b')
      expect(heap.extractMin()!.value).toBe('a')
      expect(heap.extractMin()!.value).toBe('b')
      expect(heap.extractMin()!.value).toBe('c')
    })

    it('handles single element', () => {
      const heap = new IntervalHeap<number>()
      heap.insert(5, 42)
      expect(heap.extractMin()).toEqual({ key: 5, value: 42 })
      expect(heap.isEmpty).toBe(true)
    })

    it('returns undefined when empty', () => {
      const heap = new IntervalHeap<string>()
      expect(heap.extractMin()).toBeUndefined()
    })
  })

  describe('peek', () => {
    it('returns min without removing', () => {
      const heap = new IntervalHeap<string>()
      heap.insert(3, 'c')
      heap.insert(1, 'a')
      expect(heap.peek()!.value).toBe('a')
      expect(heap.size).toBe(2)
    })

    it('returns undefined when empty', () => {
      const heap = new IntervalHeap<string>()
      expect(heap.peek()).toBeUndefined()
    })
  })

  describe('decreaseKey', () => {
    it('decreases key and reorders', () => {
      const heap = new IntervalHeap<string>()
      heap.insert(5, 'a')
      heap.insert(3, 'b')
      heap.insert(7, 'c')
      heap.decreaseKey('c', 1)
      expect(heap.extractMin()!.value).toBe('c')
    })

    it('returns false for missing value', () => {
      const heap = new IntervalHeap<string>()
      expect(heap.decreaseKey('x', 1)).toBe(false)
    })

    it('returns false if new key is larger', () => {
      const heap = new IntervalHeap<string>()
      heap.insert(1, 'a')
      expect(heap.decreaseKey('a', 5)).toBe(false)
    })
  })

  describe('increaseKey', () => {
    it('increases key and reorders', () => {
      const heap = new IntervalHeap<string>()
      heap.insert(1, 'a')
      heap.insert(2, 'b')
      heap.insert(3, 'c')
      heap.increaseKey('a', 10)
      expect(heap.extractMin()!.value).toBe('b')
      expect(heap.extractMin()!.value).toBe('c')
      expect(heap.extractMin()!.value).toBe('a')
    })

    it('returns false for missing value', () => {
      const heap = new IntervalHeap<string>()
      expect(heap.increaseKey('x', 5)).toBe(false)
    })

    it('returns false if new key is smaller', () => {
      const heap = new IntervalHeap<string>()
      heap.insert(5, 'a')
      expect(heap.increaseKey('a', 1)).toBe(false)
    })
  })

  describe('updateKey', () => {
    it('updates key up', () => {
      const heap = new IntervalHeap<string>()
      heap.insert(1, 'a')
      heap.insert(2, 'b')
      heap.updateKey('a', 10)
      expect(heap.extractMin()!.value).toBe('b')
    })

    it('updates key down', () => {
      const heap = new IntervalHeap<string>()
      heap.insert(5, 'a')
      heap.insert(1, 'b')
      heap.updateKey('a', 0)
      expect(heap.extractMin()!.value).toBe('a')
    })

    it('returns false for missing value', () => {
      const heap = new IntervalHeap<string>()
      expect(heap.updateKey('x', 1)).toBe(false)
    })
  })

  describe('has and getKey', () => {
    it('checks existence', () => {
      const heap = new IntervalHeap<string>()
      heap.insert(1, 'a')
      expect(heap.has('a')).toBe(true)
      expect(heap.has('b')).toBe(false)
    })

    it('gets key for value', () => {
      const heap = new IntervalHeap<string>()
      heap.insert(42, 'a')
      expect(heap.getKey('a')).toBe(42)
    })

    it('returns undefined for missing', () => {
      const heap = new IntervalHeap<string>()
      expect(heap.getKey('x')).toBeUndefined()
    })
  })

  describe('delete', () => {
    it('deletes element', () => {
      const heap = new IntervalHeap<string>()
      heap.insert(1, 'a')
      heap.insert(2, 'b')
      heap.insert(3, 'c')
      expect(heap.delete('b')).toBe(true)
      expect(heap.size).toBe(2)
      expect(heap.has('b')).toBe(false)
    })

    it('deletes minimum', () => {
      const heap = new IntervalHeap<string>()
      heap.insert(1, 'a')
      heap.insert(2, 'b')
      heap.delete('a')
      expect(heap.peek()!.value).toBe('b')
    })

    it('returns false for missing', () => {
      const heap = new IntervalHeap<string>()
      expect(heap.delete('x')).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears all', () => {
      const heap = new IntervalHeap<string>()
      heap.insert(1, 'a')
      heap.insert(2, 'b')
      heap.clear()
      expect(heap.isEmpty).toBe(true)
      expect(heap.size).toBe(0)
    })
  })

  describe('iteration', () => {
    it('toArray', () => {
      const heap = new IntervalHeap<string>()
      heap.insert(3, 'c')
      heap.insert(1, 'a')
      heap.insert(2, 'b')
      const arr = heap.toArray()
      expect(arr).toHaveLength(3)
    })

    it('keys', () => {
      const heap = new IntervalHeap<string>()
      heap.insert(3, 'c')
      heap.insert(1, 'a')
      expect(heap.keys()).toContain(1)
      expect(heap.keys()).toContain(3)
    })

    it('values', () => {
      const heap = new IntervalHeap<string>()
      heap.insert(1, 'a')
      heap.insert(2, 'b')
      const vals = heap.values()
      expect(vals).toContain('a')
      expect(vals).toContain('b')
    })

    it('forEach', () => {
      const heap = new IntervalHeap<number>()
      heap.insert(1, 10)
      heap.insert(2, 20)
      const result: number[] = []
      heap.forEach((e) => result.push(e.value))
      expect(result).toHaveLength(2)
    })

    it('entries generator', () => {
      const heap = new IntervalHeap<string>()
      heap.insert(1, 'a')
      heap.insert(2, 'b')
      const result = Array.from(heap.entries())
      expect(result).toHaveLength(2)
    })
  })

  describe('merge', () => {
    it('merges two heaps', () => {
      const h1 = new IntervalHeap<string>()
      h1.insert(1, 'a')
      h1.insert(3, 'c')
      const h2 = new IntervalHeap<string>()
      h2.insert(2, 'b')
      h2.insert(4, 'd')
      const merged = h1.merge(h2)
      expect(merged.size).toBe(4)
      expect(merged.extractMin()!.value).toBe('a')
      expect(merged.extractMin()!.value).toBe('b')
      expect(merged.extractMin()!.value).toBe('c')
      expect(merged.extractMin()!.value).toBe('d')
    })
  })

  describe('fromArray', () => {
    it('creates from array', () => {
      const heap = IntervalHeap.fromArray([
        { key: 3, value: 'c' },
        { key: 1, value: 'a' },
        { key: 2, value: 'b' },
      ])
      expect(heap.extractMin()!.value).toBe('a')
    })
  })

  describe('dijkstra simulation', () => {
    it('supports decrease-key for shortest path', () => {
      const heap = new IntervalHeap<string>()
      heap.insert(0, 'A')
      heap.insert(Infinity, 'B')
      heap.insert(Infinity, 'C')
      heap.decreaseKey('B', 4)
      heap.decreaseKey('C', 2)
      const order: string[] = []
      while (!heap.isEmpty) {
        order.push(heap.extractMin()!.value)
      }
      expect(order).toEqual(['A', 'C', 'B'])
    })
  })

  describe('large heap', () => {
    it('handles 1000 elements', () => {
      const heap = new IntervalHeap<number>()
      for (let i = 999; i >= 0; i--) {
        heap.insert(i, i)
      }
      for (let i = 0; i < 1000; i++) {
        expect(heap.extractMin()!.value).toBe(i)
      }
    })
  })
})
