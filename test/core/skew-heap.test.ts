import { describe, it, expect } from 'vitest'
import { SkewHeap } from '../../src/core/skew-heap/skew-heap.js'

function createMinHeap(): SkewHeap<number> {
  return new SkewHeap<number>()
}

function createMaxHeap(): SkewHeap<number> {
  return new SkewHeap<number>({
    comparator: (a, b) => b - a,
  })
}

describe('SkewHeap', () => {
  describe('constructor', () => {
    it('creates an empty heap with default comparator', () => {
      const heap = new SkewHeap<number>()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('creates a heap with custom comparator (max heap)', () => {
      const heap = createMaxHeap()
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.peek()).toBe(5)
    })

    it('creates a heap with custom comparator for strings', () => {
      const heap = new SkewHeap<string>({
        comparator: (a, b) => a.localeCompare(b),
      })
      heap.insert('cherry')
      heap.insert('apple')
      heap.insert('banana')
      expect(heap.peek()).toBe('apple')
    })

    it('handles no options argument', () => {
      const heap = new SkewHeap<number>(undefined)
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('insert', () => {
    it('inserts a single element', () => {
      const heap = createMinHeap()
      heap.insert(5)
      expect(heap.size()).toBe(1)
      expect(heap.isEmpty()).toBe(false)
      expect(heap.peek()).toBe(5)
    })

    it('inserts multiple elements in order', () => {
      const heap = createMinHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.peek()).toBe(1)
      expect(heap.size()).toBe(3)
    })

    it('inserts multiple elements in reverse order', () => {
      const heap = createMinHeap()
      heap.insert(3)
      heap.insert(2)
      heap.insert(1)
      expect(heap.peek()).toBe(1)
      expect(heap.size()).toBe(3)
    })

    it('inserts duplicate values', () => {
      const heap = createMinHeap()
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.size()).toBe(3)
      expect(heap.peek()).toBe(5)
    })

    it('inserts negative numbers', () => {
      const heap = createMinHeap()
      heap.insert(-3)
      heap.insert(-1)
      heap.insert(-5)
      expect(heap.peek()).toBe(-5)
    })

    it('inserts zero', () => {
      const heap = createMinHeap()
      heap.insert(0)
      expect(heap.peek()).toBe(0)
    })

    it('inserts floating point numbers', () => {
      const heap = createMinHeap()
      heap.insert(3.14)
      heap.insert(2.71)
      heap.insert(1.41)
      expect(heap.peek()).toBeCloseTo(1.41)
    })

    it('inserts into max heap', () => {
      const heap = createMaxHeap()
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.peek()).toBe(5)
    })

    it('maintains valid heap property after many inserts', () => {
      const heap = createMinHeap()
      for (let i = 20; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.isValid()).toBe(true)
    })

    it('inserts many equal elements', () => {
      const heap = createMinHeap()
      for (let i = 0; i < 50; i++) {
        heap.insert(42)
      }
      expect(heap.size()).toBe(50)
      expect(heap.peek()).toBe(42)
      expect(heap.isValid()).toBe(true)
    })
  })

  describe('extractMin', () => {
    it('returns undefined on empty heap', () => {
      const heap = createMinHeap()
      expect(heap.extractMin()).toBeUndefined()
    })

    it('extracts the only element', () => {
      const heap = createMinHeap()
      heap.insert(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('extracts elements in sorted order', () => {
      const heap = createMinHeap()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBeUndefined()
    })

    it('extracts elements from max heap in reverse sorted order', () => {
      const heap = createMaxHeap()
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(1)
    })

    it('handles duplicate values during extraction', () => {
      const heap = createMinHeap()
      heap.insert(2)
      heap.insert(2)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(2)
    })

    it('extracts negative numbers correctly', () => {
      const heap = createMinHeap()
      heap.insert(-5)
      heap.insert(-1)
      heap.insert(-3)
      expect(heap.extractMin()).toBe(-5)
      expect(heap.extractMin()).toBe(-3)
      expect(heap.extractMin()).toBe(-1)
    })

    it('maintains valid heap property after extractions', () => {
      const heap = createMinHeap()
      for (let i = 1; i <= 10; i++) {
        heap.insert(i)
      }
      for (let i = 1; i <= 5; i++) {
        heap.extractMin()
      }
      expect(heap.isValid()).toBe(true)
    })

    it('interleaved insert and extract', () => {
      const heap = createMinHeap()
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1)
      heap.insert(4)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(4)
      expect(heap.extractMin()).toBe(5)
    })

    it('extracts all elements leaving empty heap', () => {
      const heap = createMinHeap()
      for (let i = 0; i < 10; i++) {
        heap.insert(i)
      }
      for (let i = 0; i < 10; i++) {
        expect(heap.extractMin()).toBe(i)
      }
      expect(heap.isEmpty()).toBe(true)
      expect(heap.isValid()).toBe(true)
    })
  })

  describe('peek', () => {
    it('returns undefined on empty heap', () => {
      const heap = createMinHeap()
      expect(heap.peek()).toBeUndefined()
    })

    it('returns the minimum element', () => {
      const heap = createMinHeap()
      heap.insert(5)
      heap.insert(3)
      heap.insert(7)
      expect(heap.peek()).toBe(3)
    })

    it('does not remove the element', () => {
      const heap = createMinHeap()
      heap.insert(5)
      expect(heap.peek()).toBe(5)
      expect(heap.peek()).toBe(5)
      expect(heap.size()).toBe(1)
    })

    it('updates after extraction', () => {
      const heap = createMinHeap()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      expect(heap.peek()).toBe(2)
    })

    it('returns maximum element in max heap', () => {
      const heap = createMaxHeap()
      heap.insert(3)
      heap.insert(7)
      heap.insert(1)
      expect(heap.peek()).toBe(7)
    })
  })

  describe('merge', () => {
    it('merges two empty heaps', () => {
      const h1 = createMinHeap()
      const h2 = createMinHeap()
      const merged = h1.merge(h2)
      expect(merged.size()).toBe(0)
      expect(merged.isEmpty()).toBe(true)
    })

    it('merges empty heap with non-empty heap', () => {
      const h1 = createMinHeap()
      const h2 = createMinHeap()
      h2.insert(1)
      h2.insert(2)
      const merged = h1.merge(h2)
      expect(merged.size()).toBe(2)
      expect(merged.peek()).toBe(1)
    })

    it('merges non-empty heap with empty heap', () => {
      const h1 = createMinHeap()
      h1.insert(1)
      h1.insert(2)
      const h2 = createMinHeap()
      const merged = h1.merge(h2)
      expect(merged.size()).toBe(2)
      expect(merged.peek()).toBe(1)
    })

    it('merges two non-empty heaps', () => {
      const h1 = createMinHeap()
      h1.insert(1)
      h1.insert(3)
      h1.insert(5)
      const h2 = createMinHeap()
      h2.insert(2)
      h2.insert(4)
      h2.insert(6)
      const merged = h1.merge(h2)
      expect(merged.size()).toBe(6)
      expect(merged.toArray()).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('does not modify original heaps', () => {
      const h1 = createMinHeap()
      h1.insert(1)
      h1.insert(3)
      const h2 = createMinHeap()
      h2.insert(2)
      h2.insert(4)
      const merged = h1.merge(h2)
      expect(merged.size()).toBe(4)
      expect(h1.size()).toBe(2)
      expect(h2.size()).toBe(2)
      expect(h1.peek()).toBe(1)
      expect(h2.peek()).toBe(2)
    })

    it('merged heap is valid', () => {
      const h1 = createMinHeap()
      for (let i = 1; i <= 10; i++) h1.insert(i * 2)
      const h2 = createMinHeap()
      for (let i = 0; i < 10; i++) h2.insert(i * 2 + 1)
      const merged = h1.merge(h2)
      expect(merged.isValid()).toBe(true)
    })

    it('merges heaps with overlapping values', () => {
      const h1 = createMinHeap()
      h1.insert(1)
      h1.insert(3)
      h1.insert(5)
      const h2 = createMinHeap()
      h2.insert(1)
      h2.insert(3)
      h2.insert(5)
      const merged = h1.merge(h2)
      expect(merged.toArray()).toEqual([1, 1, 3, 3, 5, 5])
    })

    it('merges max heaps correctly', () => {
      const h1 = createMaxHeap()
      h1.insert(1)
      h1.insert(3)
      const h2 = createMaxHeap()
      h2.insert(2)
      h2.insert(4)
      const merged = h1.merge(h2)
      expect(merged.size()).toBe(4)
      expect(merged.peek()).toBe(4)
    })

    it('merged heap elements extract in order', () => {
      const h1 = createMinHeap()
      h1.insert(10)
      h1.insert(30)
      h1.insert(50)
      const h2 = createMinHeap()
      h2.insert(20)
      h2.insert(40)
      h2.insert(60)
      const merged = h1.merge(h2)
      for (let i = 10; i <= 60; i += 10) {
        expect(merged.extractMin()).toBe(i)
      }
    })

    it('merging single-element heaps', () => {
      const h1 = createMinHeap()
      h1.insert(2)
      const h2 = createMinHeap()
      h2.insert(1)
      const merged = h1.merge(h2)
      expect(merged.extractMin()).toBe(1)
      expect(merged.extractMin()).toBe(2)
    })

    it('merging heap with itself produces double', () => {
      const h1 = createMinHeap()
      h1.insert(1)
      h1.insert(2)
      h1.insert(3)
      const merged = h1.merge(h1)
      expect(merged.size()).toBe(6)
      expect(merged.toArray()).toEqual([1, 1, 2, 2, 3, 3])
      expect(h1.size()).toBe(3)
    })
  })

  describe('size', () => {
    it('returns 0 for empty heap', () => {
      const heap = createMinHeap()
      expect(heap.size()).toBe(0)
    })

    it('returns correct size after inserts', () => {
      const heap = createMinHeap()
      heap.insert(1)
      expect(heap.size()).toBe(1)
      heap.insert(2)
      expect(heap.size()).toBe(2)
      heap.insert(3)
      expect(heap.size()).toBe(3)
    })

    it('returns correct size after extractions', () => {
      const heap = createMinHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extractMin()
      expect(heap.size()).toBe(2)
      heap.extractMin()
      expect(heap.size()).toBe(1)
      heap.extractMin()
      expect(heap.size()).toBe(0)
    })

    it('returns correct size after clear', () => {
      const heap = createMinHeap()
      heap.insert(1)
      heap.insert(2)
      heap.clear()
      expect(heap.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new heap', () => {
      const heap = createMinHeap()
      expect(heap.isEmpty()).toBe(true)
    })

    it('returns false after insert', () => {
      const heap = createMinHeap()
      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)
    })

    it('returns true after extracting all elements', () => {
      const heap = createMinHeap()
      heap.insert(1)
      heap.extractMin()
      expect(heap.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const heap = createMinHeap()
      heap.insert(1)
      heap.insert(2)
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears an empty heap', () => {
      const heap = createMinHeap()
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('clears a non-empty heap', () => {
      const heap = createMinHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size()).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.peek()).toBeUndefined()
    })

    it('heap is usable after clear', () => {
      const heap = createMinHeap()
      heap.insert(5)
      heap.clear()
      heap.insert(3)
      expect(heap.peek()).toBe(3)
      expect(heap.size()).toBe(1)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = createMinHeap()
      expect(heap.toArray()).toEqual([])
    })

    it('returns single element array', () => {
      const heap = createMinHeap()
      heap.insert(5)
      expect(heap.toArray()).toEqual([5])
    })

    it('returns sorted array', () => {
      const heap = createMinHeap()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.toArray()).toEqual([1, 2, 3])
    })

    it('returns sorted array for max heap', () => {
      const heap = createMaxHeap()
      heap.insert(1)
      heap.insert(3)
      heap.insert(2)
      expect(heap.toArray()).toEqual([3, 2, 1])
    })

    it('does not modify the heap', () => {
      const heap = createMinHeap()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      const arr = heap.toArray()
      expect(arr).toEqual([1, 2, 3])
      expect(heap.size()).toBe(3)
      expect(heap.peek()).toBe(1)
    })

    it('handles duplicates', () => {
      const heap = createMinHeap()
      heap.insert(2)
      heap.insert(1)
      heap.insert(2)
      heap.insert(1)
      expect(heap.toArray()).toEqual([1, 1, 2, 2])
    })

    it('handles negative numbers', () => {
      const heap = createMinHeap()
      heap.insert(-3)
      heap.insert(0)
      heap.insert(-1)
      heap.insert(2)
      expect(heap.toArray()).toEqual([-3, -1, 0, 2])
    })
  })

  describe('contains', () => {
    it('returns false for empty heap', () => {
      const heap = createMinHeap()
      expect(heap.contains(1)).toBe(false)
    })

    it('returns true for existing element', () => {
      const heap = createMinHeap()
      heap.insert(5)
      expect(heap.contains(5)).toBe(true)
    })

    it('returns false for non-existing element', () => {
      const heap = createMinHeap()
      heap.insert(5)
      expect(heap.contains(3)).toBe(false)
    })

    it('finds elements in larger heap', () => {
      const heap = createMinHeap()
      for (let i = 0; i < 20; i++) {
        heap.insert(i)
      }
      expect(heap.contains(0)).toBe(true)
      expect(heap.contains(10)).toBe(true)
      expect(heap.contains(19)).toBe(true)
      expect(heap.contains(20)).toBe(false)
      expect(heap.contains(-1)).toBe(false)
    })

    it('returns false after element is extracted', () => {
      const heap = createMinHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.extractMin()
      expect(heap.contains(1)).toBe(false)
      expect(heap.contains(2)).toBe(true)
    })

    it('handles duplicate values', () => {
      const heap = createMinHeap()
      heap.insert(5)
      heap.insert(5)
      heap.extractMin()
      expect(heap.contains(5)).toBe(true)
    })

    it('works with strings', () => {
      const heap = new SkewHeap<string>()
      heap.insert('hello')
      heap.insert('world')
      expect(heap.contains('hello')).toBe(true)
      expect(heap.contains('world')).toBe(true)
      expect(heap.contains('foo')).toBe(false)
    })

    it('works with custom objects using comparator', () => {
      type Item = { id: number; name: string }
      const heap = new SkewHeap<Item>({
        comparator: (a, b) => a.id - b.id,
      })
      const item1: Item = { id: 1, name: 'a' }
      const item2: Item = { id: 2, name: 'b' }
      heap.insert(item1)
      heap.insert(item2)
      expect(heap.contains(item1)).toBe(true)
      expect(heap.contains(item2)).toBe(true)
    })
  })

  describe('clone', () => {
    it('clones an empty heap', () => {
      const heap = createMinHeap()
      const cloned = heap.clone()
      expect(cloned.size()).toBe(0)
      expect(cloned.isEmpty()).toBe(true)
    })

    it('clones a non-empty heap', () => {
      const heap = createMinHeap()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      const cloned = heap.clone()
      expect(cloned.size()).toBe(3)
      expect(cloned.peek()).toBe(1)
    })

    it('clone is independent of original', () => {
      const heap = createMinHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const cloned = heap.clone()
      cloned.extractMin()
      expect(heap.size()).toBe(3)
      expect(cloned.size()).toBe(2)
    })

    it('modifying original does not affect clone', () => {
      const heap = createMinHeap()
      heap.insert(1)
      heap.insert(2)
      const cloned = heap.clone()
      heap.clear()
      expect(cloned.size()).toBe(2)
      expect(cloned.peek()).toBe(1)
    })

    it('clone produces valid skew heap', () => {
      const heap = createMinHeap()
      for (let i = 10; i >= 1; i--) heap.insert(i)
      const cloned = heap.clone()
      expect(cloned.isValid()).toBe(true)
    })

    it('clone preserves comparator', () => {
      const heap = createMaxHeap()
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      const cloned = heap.clone()
      expect(cloned.peek()).toBe(5)
      expect(cloned.extractMin()).toBe(5)
      expect(cloned.extractMin()).toBe(3)
      expect(cloned.extractMin()).toBe(1)
    })

    it('clone toArray matches original toArray', () => {
      const heap = createMinHeap()
      for (let i = 0; i < 15; i++) {
        heap.insert(Math.floor(Math.random() * 100))
      }
      const cloned = heap.clone()
      expect(cloned.toArray()).toEqual(heap.toArray())
    })
  })

  describe('isValid', () => {
    it('empty heap is valid', () => {
      const heap = createMinHeap()
      expect(heap.isValid()).toBe(true)
    })

    it('single element heap is valid', () => {
      const heap = createMinHeap()
      heap.insert(1)
      expect(heap.isValid()).toBe(true)
    })

    it('heap remains valid after inserts', () => {
      const heap = createMinHeap()
      for (let i = 0; i < 20; i++) {
        heap.insert(Math.floor(Math.random() * 100))
        expect(heap.isValid()).toBe(true)
      }
    })

    it('heap remains valid after extractions', () => {
      const heap = createMinHeap()
      for (let i = 0; i < 20; i++) {
        heap.insert(i)
      }
      for (let i = 0; i < 20; i++) {
        heap.extractMin()
        expect(heap.isValid()).toBe(true)
      }
    })

    it('heap remains valid after merge', () => {
      const h1 = createMinHeap()
      const h2 = createMinHeap()
      for (let i = 0; i < 10; i++) {
        h1.insert(i)
        h2.insert(i + 10)
      }
      const merged = h1.merge(h2)
      expect(merged.isValid()).toBe(true)
    })

    it('heap remains valid after clear', () => {
      const heap = createMinHeap()
      for (let i = 0; i < 10; i++) heap.insert(i)
      heap.clear()
      expect(heap.isValid()).toBe(true)
    })

    it('heap with all equal elements is valid', () => {
      const heap = createMinHeap()
      for (let i = 0; i < 10; i++) heap.insert(42)
      expect(heap.isValid()).toBe(true)
    })
  })

  describe('stress tests', () => {
    it('handles 1000 sequential inserts and extracts', () => {
      const heap = createMinHeap()
      for (let i = 1000; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.size()).toBe(1000)
      expect(heap.isValid()).toBe(true)
      for (let i = 1; i <= 1000; i++) {
        expect(heap.extractMin()).toBe(i)
      }
      expect(heap.isEmpty()).toBe(true)
    })

    it('handles 1000 random inserts and sorted extraction', () => {
      const heap = createMinHeap()
      const values: number[] = []
      for (let i = 0; i < 1000; i++) {
        const v = Math.floor(Math.random() * 10000)
        values.push(v)
        heap.insert(v)
      }
      values.sort((a, b) => a - b)
      for (let i = 0; i < 1000; i++) {
        expect(heap.extractMin()).toBe(values[i])
      }
    })

    it('handles 1000 elements in merge', () => {
      const h1 = createMinHeap()
      const h2 = createMinHeap()
      for (let i = 0; i < 500; i++) {
        h1.insert(i * 2)
        h2.insert(i * 2 + 1)
      }
      const merged = h1.merge(h2)
      expect(merged.size()).toBe(1000)
      expect(merged.isValid()).toBe(true)
      for (let i = 0; i < 1000; i++) {
        expect(merged.extractMin()).toBe(i)
      }
    })

    it('handles interleaved operations on 1000 elements', () => {
      const heap = createMinHeap()
      let expectedSize = 0
      for (let i = 0; i < 1000; i++) {
        heap.insert(Math.floor(Math.random() * 5000))
        expectedSize++
        if (i % 3 === 0 && expectedSize > 0) {
          const val = heap.extractMin()
          expect(val).not.toBeUndefined()
          expectedSize--
        }
      }
      expect(heap.size()).toBe(expectedSize)
      expect(heap.isValid()).toBe(true)
      const remaining = heap.toArray()
      for (let i = 1; i < remaining.length; i++) {
        expect(remaining[i]).toBeGreaterThanOrEqual(remaining[i - 1]!)
      }
    })

    it('handles cloning 1000 element heap', () => {
      const heap = createMinHeap()
      for (let i = 0; i < 1000; i++) {
        heap.insert(i)
      }
      const cloned = heap.clone()
      expect(cloned.size()).toBe(1000)
      expect(cloned.isValid()).toBe(true)
      expect(cloned.toArray()).toEqual(heap.toArray())
    })

    it('handles toArray on 1000 elements', () => {
      const heap = createMinHeap()
      for (let i = 999; i >= 0; i--) {
        heap.insert(i)
      }
      const arr = heap.toArray()
      expect(arr.length).toBe(1000)
      for (let i = 0; i < 1000; i++) {
        expect(arr[i]).toBe(i)
      }
    })

    it('handles contains on large heap', () => {
      const heap = createMinHeap()
      for (let i = 0; i < 1000; i++) {
        heap.insert(i)
      }
      for (let i = 0; i < 1000; i++) {
        expect(heap.contains(i)).toBe(true)
      }
      expect(heap.contains(-1)).toBe(false)
      expect(heap.contains(1000)).toBe(false)
    })

    it('handles repeated merge operations', () => {
      let heap = createMinHeap()
      for (let batch = 0; batch < 10; batch++) {
        const other = createMinHeap()
        for (let i = 0; i < 100; i++) {
          other.insert(batch * 100 + i)
        }
        heap = heap.merge(other)
      }
      expect(heap.size()).toBe(1000)
      expect(heap.isValid()).toBe(true)
      for (let i = 0; i < 1000; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })
  })

  describe('edge cases', () => {
    it('works with strings', () => {
      const heap = new SkewHeap<string>()
      heap.insert('delta')
      heap.insert('alpha')
      heap.insert('charlie')
      heap.insert('bravo')
      expect(heap.extractMin()).toBe('alpha')
      expect(heap.extractMin()).toBe('bravo')
      expect(heap.extractMin()).toBe('charlie')
      expect(heap.extractMin()).toBe('delta')
    })

    it('works with objects using custom comparator', () => {
      type Point = { x: number; y: number }
      const heap = new SkewHeap<Point>({
        comparator: (a, b) => a.x - b.x || a.y - b.y,
      })
      heap.insert({ x: 3, y: 1 })
      heap.insert({ x: 1, y: 2 })
      heap.insert({ x: 1, y: 1 })
      const first = heap.extractMin()
      expect(first?.x).toBe(1)
      expect(first?.y).toBe(1)
      const second = heap.extractMin()
      expect(second?.x).toBe(1)
      expect(second?.y).toBe(2)
    })

    it('handles insertion of already sorted sequence', () => {
      const heap = createMinHeap()
      for (let i = 1; i <= 50; i++) {
        heap.insert(i)
      }
      expect(heap.isValid()).toBe(true)
      expect(heap.peek()).toBe(1)
      for (let i = 1; i <= 50; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('handles insertion of reverse sorted sequence', () => {
      const heap = createMinHeap()
      for (let i = 50; i >= 1; i--) {
        heap.insert(i)
      }
      expect(heap.isValid()).toBe(true)
      for (let i = 1; i <= 50; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })

    it('handles single element edge case', () => {
      const heap = createMinHeap()
      heap.insert(42)
      expect(heap.size()).toBe(1)
      expect(heap.peek()).toBe(42)
      expect(heap.extractMin()).toBe(42)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.peek()).toBeUndefined()
      expect(heap.extractMin()).toBeUndefined()
    })

    it('handles two elements', () => {
      const heap = createMinHeap()
      heap.insert(2)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
    })

    it('handles clearing and reusing', () => {
      const heap = createMinHeap()
      for (let i = 0; i < 5; i++) heap.insert(i)
      heap.clear()
      expect(heap.isValid()).toBe(true)
      for (let i = 10; i < 20; i++) heap.insert(i)
      expect(heap.size()).toBe(10)
      expect(heap.peek()).toBe(10)
      expect(heap.isValid()).toBe(true)
    })

    it('extractMin on empty heap returns undefined repeatedly', () => {
      const heap = createMinHeap()
      expect(heap.extractMin()).toBeUndefined()
      expect(heap.extractMin()).toBeUndefined()
      expect(heap.extractMin()).toBeUndefined()
      expect(heap.size()).toBe(0)
    })

    it('large values', () => {
      const heap = createMinHeap()
      heap.insert(Number.MAX_SAFE_INTEGER)
      heap.insert(Number.MIN_SAFE_INTEGER)
      heap.insert(0)
      expect(heap.extractMin()).toBe(Number.MIN_SAFE_INTEGER)
      expect(heap.extractMin()).toBe(0)
      expect(heap.extractMin()).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('NaN handling with custom comparator', () => {
      const heap = new SkewHeap<number>({
        comparator: (a, b) => {
          if (Number.isNaN(a) && Number.isNaN(b)) return 0
          if (Number.isNaN(a)) return 1
          if (Number.isNaN(b)) return -1
          return a - b
        },
      })
      heap.insert(3)
      heap.insert(NaN)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBeNaN()
    })

    it('merge chain of three heaps', () => {
      const h1 = createMinHeap()
      h1.insert(1)
      h1.insert(4)
      const h2 = createMinHeap()
      h2.insert(2)
      h2.insert(5)
      const h3 = createMinHeap()
      h3.insert(3)
      h3.insert(6)
      const merged = h1.merge(h2).merge(h3)
      expect(merged.toArray()).toEqual([1, 2, 3, 4, 5, 6])
      expect(h1.size()).toBe(2)
    })
  })

  describe('type safety', () => {
    it('works with number type', () => {
      const heap = new SkewHeap<number>()
      heap.insert(1)
      const val: number | undefined = heap.extractMin()
      expect(typeof val).toBe('number')
    })

    it('works with string type', () => {
      const heap = new SkewHeap<string>()
      heap.insert('test')
      const val: string | undefined = heap.extractMin()
      expect(typeof val).toBe('string')
    })

    it('works with custom type', () => {
      type PriorityItem = { priority: number; label: string }
      const heap = new SkewHeap<PriorityItem>({
        comparator: (a, b) => a.priority - b.priority,
      })
      heap.insert({ priority: 3, label: 'low' })
      heap.insert({ priority: 1, label: 'high' })
      heap.insert({ priority: 2, label: 'medium' })
      const first = heap.extractMin()
      expect(first?.label).toBe('high')
      expect(first?.priority).toBe(1)
    })
  })

  describe('complex merge scenarios', () => {
    it('merge preserves ordering for alternating insert heaps', () => {
      const h1 = createMinHeap()
      const h2 = createMinHeap()
      for (let i = 0; i < 50; i++) {
        if (i % 2 === 0) h1.insert(i)
        else h2.insert(i)
      }
      const merged = h1.merge(h2)
      for (let i = 0; i < 50; i++) {
        expect(merged.extractMin()).toBe(i)
      }
    })

    it('merge empty into empty returns empty', () => {
      const h1 = createMinHeap()
      const h2 = createMinHeap()
      const merged = h1.merge(h2)
      expect(merged.isEmpty()).toBe(true)
      expect(merged.size()).toBe(0)
    })

    it('multiple merges maintain validity', () => {
      let heap = createMinHeap()
      for (let round = 0; round < 5; round++) {
        const other = createMinHeap()
        for (let i = 0; i < 20; i++) {
          other.insert(round * 20 + i)
        }
        heap = heap.merge(other)
        expect(heap.isValid()).toBe(true)
      }
      expect(heap.size()).toBe(100)
    })

    it('merge and extract interleaved', () => {
      const h1 = createMinHeap()
      h1.insert(1)
      h1.insert(5)
      const h2 = createMinHeap()
      h2.insert(2)
      h2.insert(4)
      const merged = h1.merge(h2)
      expect(merged.extractMin()).toBe(1)
      expect(merged.extractMin()).toBe(2)
      const h3 = createMinHeap()
      h3.insert(0)
      h3.insert(3)
      const merged2 = merged.merge(h3)
      expect(merged2.extractMin()).toBe(0)
      expect(merged2.extractMin()).toBe(3)
      expect(merged2.extractMin()).toBe(4)
      expect(merged2.extractMin()).toBe(5)
    })
  })

  describe('toArray independence', () => {
    it('multiple toArray calls return same result', () => {
      const heap = createMinHeap()
      for (let i = 5; i >= 1; i--) heap.insert(i)
      expect(heap.toArray()).toEqual([1, 2, 3, 4, 5])
      expect(heap.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('toArray after partial extract', () => {
      const heap = createMinHeap()
      for (let i = 5; i >= 1; i--) heap.insert(i)
      heap.extractMin()
      heap.extractMin()
      expect(heap.toArray()).toEqual([3, 4, 5])
    })
  })

  describe('contains edge cases', () => {
    it('contains after clear', () => {
      const heap = createMinHeap()
      heap.insert(1)
      heap.insert(2)
      heap.clear()
      expect(heap.contains(1)).toBe(false)
      expect(heap.contains(2)).toBe(false)
    })

    it('contains on cloned heap', () => {
      const heap = createMinHeap()
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      const cloned = heap.clone()
      expect(cloned.contains(1)).toBe(true)
      expect(cloned.contains(2)).toBe(true)
      expect(cloned.contains(3)).toBe(true)
      expect(cloned.contains(4)).toBe(false)
    })

    it('contains on merged heap', () => {
      const h1 = createMinHeap()
      h1.insert(1)
      h1.insert(3)
      const h2 = createMinHeap()
      h2.insert(2)
      h2.insert(4)
      const merged = h1.merge(h2)
      expect(merged.contains(1)).toBe(true)
      expect(merged.contains(2)).toBe(true)
      expect(merged.contains(3)).toBe(true)
      expect(merged.contains(4)).toBe(true)
      expect(merged.contains(5)).toBe(false)
    })
  })

  describe('clone edge cases', () => {
    it('double clone', () => {
      const heap = createMinHeap()
      for (let i = 0; i < 5; i++) heap.insert(i)
      const cloned = heap.clone().clone()
      expect(cloned.toArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('clone of empty heap is usable', () => {
      const heap = createMinHeap()
      const cloned = heap.clone()
      cloned.insert(1)
      expect(cloned.peek()).toBe(1)
      expect(heap.isEmpty()).toBe(true)
    })
  })

  describe('skew heap specific behavior', () => {
    it('always swaps children during merge', () => {
      const heap = createMinHeap()
      heap.insert(10)
      heap.insert(20)
      heap.insert(5)
      heap.insert(15)
      heap.insert(25)
      expect(heap.isValid()).toBe(true)
      const arr = heap.toArray()
      expect(arr).toEqual([5, 10, 15, 20, 25])
    })

    it('children swap property maintained after extractMin', () => {
      const heap = createMinHeap()
      for (let i = 1; i <= 20; i++) {
        heap.insert(i)
      }
      for (let i = 1; i <= 10; i++) {
        heap.extractMin()
        expect(heap.isValid()).toBe(true)
      }
      expect(heap.peek()).toBe(11)
    })

    it('merge of skewed trees with different heights', () => {
      const h1 = createMinHeap()
      for (let i = 0; i < 100; i++) h1.insert(i)
      const h2 = createMinHeap()
      h2.insert(50)
      const merged = h1.merge(h2)
      expect(merged.isValid()).toBe(true)
      expect(merged.size()).toBe(101)
    })

    it('rapid insert extract cycle', () => {
      const heap = createMinHeap()
      for (let i = 0; i < 100; i++) {
        heap.insert(i)
        heap.extractMin()
      }
      expect(heap.isEmpty()).toBe(true)
    })

    it('merge then extract maintains order', () => {
      const h1 = createMinHeap()
      h1.insert(1)
      h1.insert(4)
      h1.insert(7)
      const h2 = createMinHeap()
      h2.insert(2)
      h2.insert(5)
      h2.insert(8)
      const merged = h1.merge(h2)
      const result: number[] = []
      while (!merged.isEmpty()) {
        result.push(merged.extractMin()!)
      }
      expect(result).toEqual([1, 2, 4, 5, 7, 8])
    })

    it('merge preserves heap order with identical elements', () => {
      const h1 = createMinHeap()
      h1.insert(5)
      h1.insert(5)
      h1.insert(5)
      const h2 = createMinHeap()
      h2.insert(5)
      h2.insert(5)
      const merged = h1.merge(h2)
      expect(merged.size()).toBe(5)
      expect(merged.isValid()).toBe(true)
      for (let i = 0; i < 5; i++) {
        expect(merged.extractMin()).toBe(5)
      }
    })

    it('self merge doubles the heap correctly', () => {
      const heap = createMinHeap()
      heap.insert(1)
      heap.insert(3)
      heap.insert(2)
      const doubled = heap.merge(heap)
      expect(doubled.size()).toBe(6)
      expect(doubled.toArray()).toEqual([1, 1, 2, 2, 3, 3])
      expect(heap.size()).toBe(3)
    })

    it('sequential merges build correct heap', () => {
      let heap = createMinHeap()
      for (let i = 0; i < 5; i++) {
        const other = createMinHeap()
        other.insert(i)
        heap = heap.merge(other)
      }
      expect(heap.size()).toBe(5)
      expect(heap.isValid()).toBe(true)
      for (let i = 0; i < 5; i++) {
        expect(heap.extractMin()).toBe(i)
      }
    })
  })
})
