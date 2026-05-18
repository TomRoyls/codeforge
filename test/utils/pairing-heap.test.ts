import { beforeEach, describe, expect, it } from 'vitest'

import { PairingHeap } from '../../src/utils/pairing-heap.js'

// ─── Empty Heap Operations ──────────────────────────────────────────────
describe('PairingHeap', () => {
  let heap: PairingHeap<number>

  beforeEach(() => {
    heap = new PairingHeap<number>()
  })

  describe('empty heap', () => {
    it('returns undefined from peek on empty heap', () => {
      expect(heap.peek()).toBeUndefined()
    })

    it('returns undefined from findMin on empty heap', () => {
      expect(heap.findMin()).toBeUndefined()
    })

    it('returns undefined from extractMin on empty heap', () => {
      expect(heap.extractMin()).toBeUndefined()
    })

    it('isEmpty returns true for empty heap', () => {
      expect(heap.isEmpty()).toBe(true)
    })

    it('size is 0 for empty heap', () => {
      expect(heap.size).toBe(0)
    })
  })

  // ─── Insert ─────────────────────────────────────────────────────────────
  describe('insert', () => {
    it('inserts a single element', () => {
      heap.insert(10)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(10)
    })

    it('returns a node reference with the value', () => {
      const node = heap.insert(42)
      expect(node.value).toBe(42)
    })

    it('maintains min-heap property with multiple inserts', () => {
      heap.insert(30)
      heap.insert(10)
      heap.insert(20)
      expect(heap.peek()).toBe(10)
    })
  })

  // ─── ExtractMin ─────────────────────────────────────────────────────────
  describe('extractMin', () => {
    it('extracts the single element', () => {
      heap.insert(99)
      expect(heap.extractMin()).toBe(99)
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('extracts elements in sorted order', () => {
      heap.insert(30)
      heap.insert(10)
      heap.insert(20)
      expect(heap.extractMin()).toBe(10)
      expect(heap.extractMin()).toBe(20)
      expect(heap.extractMin()).toBe(30)
    })

    it('returns undefined after all elements extracted', () => {
      heap.insert(1)
      heap.extractMin()
      expect(heap.extractMin()).toBeUndefined()
    })
  })

  // ─── Merge ──────────────────────────────────────────────────────────────
  describe('merge', () => {
    it('merges two non-empty heaps', () => {
      const other = new PairingHeap<number>()
      heap.insert(5)
      heap.insert(10)
      other.insert(2)
      other.insert(8)

      heap.merge(other)
      expect(heap.size).toBe(4)
      expect(heap.peek()).toBe(2)
      expect(other.size).toBe(0)
      expect(other.isEmpty()).toBe(true)
    })

    it('merges empty heap into non-empty (no-op)', () => {
      heap.insert(5)
      const other = new PairingHeap<number>()
      heap.merge(other)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(5)
    })

    it('merges non-empty heap into empty heap', () => {
      const other = new PairingHeap<number>()
      other.insert(3)
      other.insert(7)
      heap.merge(other)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(3)
    })

    it('merges two empty heaps', () => {
      const other = new PairingHeap<number>()
      heap.merge(other)
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })
  })

  // ─── DecreaseKey ────────────────────────────────────────────────────────
  describe('decreaseKey', () => {
    it('decreases a node value and updates min', () => {
      const nodeA = heap.insert(10)
      heap.insert(5)
      heap.insert(8)
      heap.decreaseKey(nodeA, 1)
      expect(heap.peek()).toBe(1)
    })

    it('throws if new value is greater than current', () => {
      const node = heap.insert(5)
      expect(() => heap.decreaseKey(node, 10)).toThrow()
    })

    it('works after extractMin triggers two-pass pairing', () => {
      const nodes: ReturnType<PairingHeap<number>['insert']>[] = []
      for (let i = 10; i >= 1; i--) {
        nodes.push(heap.insert(i))
      }
      heap.extractMin()
      heap.decreaseKey(nodes[0]!, 0)
      expect(heap.peek()).toBe(0)
    })
  })

  // ─── Delete ─────────────────────────────────────────────────────────────
  describe('delete', () => {
    it('removes a specific node', () => {
      const nodeB = heap.insert(3)
      const nodeA = heap.insert(5)
      heap.insert(7)
      heap.delete(nodeB)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(5)
      heap.delete(nodeA)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(7)
    })

    it('deleting the root node works', () => {
      const root = heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      heap.delete(root)
      expect(heap.size).toBe(2)
      expect(heap.peek()).toBe(3)
    })
  })

  // ─── Clear ──────────────────────────────────────────────────────────────
  describe('clear', () => {
    it('empties the heap completely', () => {
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.peek()).toBeUndefined()
      expect(heap.extractMin()).toBeUndefined()
    })
  })

  // ─── Size Tracking ──────────────────────────────────────────────────────
  describe('size tracking', () => {
    it('tracks size correctly through mixed operations', () => {
      expect(heap.size).toBe(0)
      heap.insert(1)
      expect(heap.size).toBe(1)
      heap.insert(2)
      expect(heap.size).toBe(2)
      heap.extractMin()
      expect(heap.size).toBe(1)
      heap.insert(3)
      expect(heap.size).toBe(2)
      heap.extractMin()
      heap.extractMin()
      expect(heap.size).toBe(0)
    })
  })

  // ─── Custom Comparator (Max Heap) ──────────────────────────────────────
  describe('custom comparator', () => {
    it('supports max-heap via reversed comparator', () => {
      const maxHeap = new PairingHeap<number>({
        comparator: (a, b) => b - a,
      })
      maxHeap.insert(10)
      maxHeap.insert(30)
      maxHeap.insert(20)
      expect(maxHeap.peek()).toBe(30)
      expect(maxHeap.extractMin()).toBe(30)
      expect(maxHeap.extractMin()).toBe(20)
      expect(maxHeap.extractMin()).toBe(10)
    })
  })

  // ─── Large Number of Elements ───────────────────────────────────────────
  describe('large number of elements', () => {
    it('handles 200 elements correctly', () => {
      const items = Array.from({ length: 200 }, (_, i) => i + 1)
      const shuffled = [...items]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      for (const item of shuffled) {
        heap.insert(item)
      }
      for (let i = 1; i <= 200; i++) {
        expect(heap.extractMin()).toBe(i)
      }
      expect(heap.isEmpty()).toBe(true)
    })
  })

  // ─── Duplicate Values ──────────────────────────────────────────────────
  describe('duplicate values', () => {
    it('handles duplicate values correctly', () => {
      heap.insert(5)
      heap.insert(5)
      heap.insert(3)
      heap.insert(3)
      heap.insert(7)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(3)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.extractMin()).toBe(7)
    })
  })

  // ─── Sequential Extracts ────────────────────────────────────────────────
  describe('sequential extracts', () => {
    it('extracts all returns sorted order', () => {
      const values = [42, 17, 8, 99, 3, 23, 56, 1, 71, 34]
      for (const v of values) {
        heap.insert(v)
      }
      const sorted = [...values].sort((a, b) => a - b)
      for (const expected of sorted) {
        expect(heap.extractMin()).toBe(expected)
      }
      expect(heap.isEmpty()).toBe(true)
    })
  })

  // ─── Interleaved Insert/Extract ─────────────────────────────────────────
  describe('interleaved operations', () => {
    it('handles interleaved insert and extract', () => {
      heap.insert(5)
      expect(heap.extractMin()).toBe(5)
      expect(heap.isEmpty()).toBe(true)
      heap.insert(3)
      heap.insert(7)
      expect(heap.extractMin()).toBe(3)
      heap.insert(1)
      heap.insert(4)
      expect(heap.extractMin()).toBe(1)
      expect(heap.extractMin()).toBe(4)
      expect(heap.extractMin()).toBe(7)
      expect(heap.isEmpty()).toBe(true)
    })
  })
})
