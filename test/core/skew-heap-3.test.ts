import { describe, it, expect } from 'vitest'
import { SkewHeap3 } from '../../src/core/skew-heap-3/index.js'

function createMinHeap(): SkewHeap3<number> {
  return new SkewHeap3<number>()
}

function createMaxHeap(): SkewHeap3<number> {
  return new SkewHeap3<number>((a, b) => b - a)
}

// ─── Constructor ───

describe('SkewHeap3', () => {
  describe('constructor', () => {
    it('creates an empty min-heap by default', () => {
      const heap = new SkewHeap3<number>()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('creates a max-heap with custom comparator', () => {
      const heap = createMaxHeap()
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.peek()).toBe(5)
    })

    it('creates a heap with string comparator', () => {
      const heap = new SkewHeap3<string>((a, b) => a.localeCompare(b))
      heap.insert('cherry')
      heap.insert('apple')
      heap.insert('banana')
      expect(heap.peek()).toBe('apple')
    })
  })

  // ─── Insert ───

  describe('insert', () => {
    it('inserts a single element', () => {
      const heap = createMinHeap()
      heap.insert(5)
      expect(heap.size).toBe(1)
      expect(heap.isEmpty()).toBe(false)
      expect(heap.peek()).toBe(5)
    })

    it('inserts multiple elements maintaining heap property', () => {
      const heap = createMinHeap()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(3)
    })

    it('inserts duplicate values', () => {
      const heap = createMinHeap()
      heap.insert(5)
      heap.insert(5)
      heap.insert(5)
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(5)
    })

    it('inserts negative numbers', () => {
      const heap = createMinHeap()
      heap.insert(-3)
      heap.insert(-1)
      heap.insert(-5)
      expect(heap.peek()).toBe(-5)
    })

    it('inserts into max heap', () => {
      const heap = createMaxHeap()
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.peek()).toBe(5)
    })
  })

  // ─── ExtractMin ───

  describe('extractMin', () => {
    it('returns undefined on empty heap', () => {
      const heap = createMinHeap()
      expect(heap.extractMin()).toBeUndefined()
    })

    it('extracts the only element', () => {
      const heap = createMinHeap()
      heap.insert(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.size).toBe(0)
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

    it('extracts from max heap in reverse sorted order', () => {
      const heap = createMaxHeap()
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(1)
    })

    it('handles duplicates during extraction', () => {
      const heap = createMinHeap()
      heap.insert(2)
      heap.insert(2)
      heap.insert(1)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(2)
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
      for (let i = 0; i < 10; i++) heap.insert(i)
      for (let i = 0; i < 10; i++) {
        expect(heap.extractMin()).toBe(i)
      }
      expect(heap.isEmpty()).toBe(true)
    })
  })

  // ─── Peek ───

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
      expect(heap.size).toBe(1)
    })

    it('updates after extraction', () => {
      const heap = createMinHeap()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      heap.extractMin()
      expect(heap.peek()).toBe(2)
    })
  })

  // ─── Merge ───

  describe('merge', () => {
    it('merges two non-empty heaps', () => {
      const h1 = createMinHeap()
      h1.insert(1)
      h1.insert(3)
      const h2 = createMinHeap()
      h2.insert(2)
      h2.insert(4)
      h1.merge(h2)
      expect(h1.size).toBe(4)
      expect(h2.size).toBe(0)
      expect(h1.extractMin()).toBe(1)
      expect(h1.extractMin()).toBe(2)
      expect(h1.extractMin()).toBe(3)
      expect(h1.extractMin()).toBe(4)
    })

    it('merging empty heap is no-op', () => {
      const h1 = createMinHeap()
      h1.insert(1)
      const h2 = createMinHeap()
      h1.merge(h2)
      expect(h1.size).toBe(1)
      expect(h1.peek()).toBe(1)
    })

    it('merging into empty heap', () => {
      const h1 = createMinHeap()
      const h2 = createMinHeap()
      h2.insert(5)
      h1.merge(h2)
      expect(h1.size).toBe(1)
      expect(h1.peek()).toBe(5)
      expect(h2.isEmpty()).toBe(true)
    })

    it('clears the other heap after merge', () => {
      const h1 = createMinHeap()
      h1.insert(1)
      const h2 = createMinHeap()
      h2.insert(2)
      h2.insert(3)
      h1.merge(h2)
      expect(h2.size).toBe(0)
      expect(h2.isEmpty()).toBe(true)
    })
  })

  // ─── Size and isEmpty ───

  describe('size and isEmpty', () => {
    it('tracks size correctly', () => {
      const heap = createMinHeap()
      expect(heap.size).toBe(0)
      heap.insert(1)
      expect(heap.size).toBe(1)
      heap.insert(2)
      expect(heap.size).toBe(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
    })

    it('isEmpty reflects state', () => {
      const heap = createMinHeap()
      expect(heap.isEmpty()).toBe(true)
      heap.insert(1)
      expect(heap.isEmpty()).toBe(false)
      heap.extractMin()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  // ─── Clear ───

  describe('clear', () => {
    it('clears a non-empty heap', () => {
      const heap = createMinHeap()
      heap.insert(1)
      heap.insert(2)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.peek()).toBeUndefined()
    })

    it('heap is usable after clear', () => {
      const heap = createMinHeap()
      heap.insert(5)
      heap.clear()
      heap.insert(3)
      expect(heap.peek()).toBe(3)
      expect(heap.size).toBe(1)
    })
  })

  // ─── toArray ───

  describe('toArray', () => {
    it('returns empty array for empty heap', () => {
      const heap = createMinHeap()
      expect(heap.toArray()).toEqual([])
    })

    it('returns elements in BFS order', () => {
      const heap = createMinHeap()
      heap.insert(5)
      expect(heap.toArray()).toEqual([5])
    })

    it('does not modify the heap', () => {
      const heap = createMinHeap()
      heap.insert(3)
      heap.insert(1)
      heap.insert(2)
      heap.toArray()
      expect(heap.size).toBe(3)
      expect(heap.peek()).toBe(1)
    })
  })

  // ─── fromArray ───

  describe('fromArray', () => {
    it('creates heap from array', () => {
      const heap = SkewHeap3.fromArray([3, 1, 2])
      expect(heap.size).toBe(3)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(3)
    })

    it('creates heap from empty array', () => {
      const heap = SkewHeap3.fromArray([])
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('creates heap with custom comparator', () => {
      const heap = SkewHeap3.fromArray([1, 3, 2], (a, b) => b - a)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(2)
      expect(heap.extractMin()).toBe(1)
    })
  })

  // ─── Edge Cases ───

  describe('edge cases', () => {
    it('handles 100 sequential inserts and extracts', () => {
      const heap = createMinHeap()
      for (let i = 100; i >= 1; i--) heap.insert(i)
      for (let i = 1; i <= 100; i++) {
        expect(heap.extractMin()).toBe(i)
      }
      expect(heap.isEmpty()).toBe(true)
    })

    it('works with strings', () => {
      const heap = new SkewHeap3<string>()
      heap.insert('delta')
      heap.insert('alpha')
      heap.insert('charlie')
      expect(heap.extractMin()).toBe('alpha')
      expect(heap.extractMin()).toBe('charlie')
      expect(heap.extractMin()).toBe('delta')
    })

    it('works with custom objects', () => {
      type Item = { priority: number; label: string }
      const heap = new SkewHeap3<Item>((a, b) => a.priority - b.priority)
      heap.insert({ priority: 3, label: 'low' })
      heap.insert({ priority: 1, label: 'high' })
      heap.insert({ priority: 2, label: 'medium' })
      const first = heap.extractMin()
      expect(first?.label).toBe('high')
    })

    it('extractMin on empty returns undefined repeatedly', () => {
      const heap = createMinHeap()
      expect(heap.extractMin()).toBeUndefined()
      expect(heap.extractMin()).toBeUndefined()
      expect(heap.size).toBe(0)
    })

    it('handles large values', () => {
      const heap = createMinHeap()
      heap.insert(Number.MAX_SAFE_INTEGER)
      heap.insert(Number.MIN_SAFE_INTEGER)
      heap.insert(0)
      expect(heap.extractMin()).toBe(Number.MIN_SAFE_INTEGER)
      expect(heap.extractMin()).toBe(0)
      expect(heap.extractMin()).toBe(Number.MAX_SAFE_INTEGER)
    })
  })
})
