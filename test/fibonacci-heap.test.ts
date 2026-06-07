import { beforeEach, describe, expect, it } from 'vitest'

import { FibonacciHeap } from '../src/utils/fibonacci-heap.js'

// Helper: assert a heap node has the expected key and value
function expectNode<V>(node: { key: number; value: V } | undefined, key: number, value: V): void {
  expect(node).toBeDefined()
  expect(node!.key).toBe(key)
  expect(node!.value).toBe(value)
}

// ─── constructor ───────────────────────────────────────
describe('FibonacciHeap', () => {
  it('creates an empty heap', () => {
    const heap = new FibonacciHeap<number>()
    expect(heap.size).toBe(0)
    expect(heap.isEmpty()).toBe(true)
    expect(heap.min).toBeUndefined()
  })

  // ─── insert ─────────────────────────────────────────
  describe('insert', () => {
    it('adds elements and increments size', () => {
      const heap = new FibonacciHeap<string>()
      heap.insert(5, 'a')
      expect(heap.size).toBe(1)
      expect(heap.isEmpty()).toBe(false)
      expectNode(heap.min, 5, 'a')
    })

    it('updates min when inserting smaller key', () => {
      const heap = new FibonacciHeap<string>()
      heap.insert(10, 'a')
      heap.insert(3, 'b')
      heap.insert(7, 'c')
      expectNode(heap.min, 3, 'b')
    })
  })

  // ─── extractMin ─────────────────────────────────────
  describe('extractMin', () => {
    it('returns the minimum element and removes it', () => {
      const heap = new FibonacciHeap<string>()
      heap.insert(3, 'c')
      heap.insert(1, 'a')
      heap.insert(2, 'b')

      expectNode(heap.extractMin(), 1, 'a')
      expect(heap.size).toBe(2)
      expectNode(heap.extractMin(), 2, 'b')
      expectNode(heap.extractMin(), 3, 'c')
      expect(heap.size).toBe(0)
    })

    it('returns undefined when heap is empty', () => {
      const heap = new FibonacciHeap<number>()
      expect(heap.extractMin()).toBeUndefined()
    })
  })

  // ─── min ────────────────────────────────────────────
  describe('min', () => {
    it('returns min without removing it', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(5, 5)
      heap.insert(2, 2)
      expectNode(heap.min, 2, 2)
      expect(heap.size).toBe(2)
    })
  })

  // ─── heap order ─────────────────────────────────────
  describe('heap order', () => {
    it('insert items in random order and extract all ascending', () => {
      const heap = new FibonacciHeap<number>()
      const items = [42, 17, 8, 99, 3, 23, 56, 1, 71, 34]
      for (const item of items) {
        heap.insert(item, item)
      }

      const sorted = [...items].sort((a, b) => a - b)
      for (const expected of sorted) {
        expectNode(heap.extractMin(), expected, expected)
      }
      expect(heap.isEmpty()).toBe(true)
    })
  })

  // ─── decreaseKey ────────────────────────────────────
  describe('decreaseKey', () => {
    it('decreases key and updates min', () => {
      const heap = new FibonacciHeap<string>()
      const nodeA = heap.insert(10, 'a')
      heap.insert(5, 'b')
      heap.insert(8, 'c')

      heap.decreaseKey(nodeA, 1)
      expectNode(heap.min, 1, 'a')
    })

    it('throws if new key >= current key', () => {
      const heap = new FibonacciHeap<string>()
      const node = heap.insert(5, 'a')
      expect(() => heap.decreaseKey(node, 5)).toThrow()
      expect(() => heap.decreaseKey(node, 10)).toThrow()
    })

    it('works after extractMin triggers consolidation', () => {
      const heap = new FibonacciHeap<string>()
      const nodes: ReturnType<typeof heap.insert>[] = []
      for (let i = 10; i >= 1; i--) {
        nodes.push(heap.insert(i, `v${i}`))
      }

      heap.extractMin()

      heap.decreaseKey(nodes[0], 0)
      expectNode(heap.min, 0, 'v10')
    })
  })

  // ─── delete ─────────────────────────────────────────
  describe('delete', () => {
    it('removes a specific node', () => {
      const heap = new FibonacciHeap<string>()
      const nodeA = heap.insert(5, 'a')
      const nodeB = heap.insert(3, 'b')
      heap.insert(7, 'c')

      heap.delete(nodeB)
      expect(heap.size).toBe(2)
      expectNode(heap.min, 5, 'a')

      heap.delete(nodeA)
      expect(heap.size).toBe(1)
      expectNode(heap.min, 7, 'c')
    })
  })

  // ─── merge ──────────────────────────────────────────
  describe('merge', () => {
    it('combines two heaps', () => {
      const heap1 = new FibonacciHeap<string>()
      heap1.insert(5, 'a')
      heap1.insert(10, 'b')

      const heap2 = new FibonacciHeap<string>()
      heap2.insert(2, 'c')
      heap2.insert(8, 'd')

      heap1.merge(heap2)
      expect(heap1.size).toBe(4)
      expectNode(heap1.min, 2, 'c')
      expect(heap2.size).toBe(0)
      expect(heap2.isEmpty()).toBe(true)
    })

    it('merging into empty heap works', () => {
      const heap1 = new FibonacciHeap<number>()
      const heap2 = new FibonacciHeap<number>()
      heap2.insert(1, 1)
      heap2.insert(2, 2)

      heap1.merge(heap2)
      expect(heap1.size).toBe(2)
      expectNode(heap1.min, 1, 1)
    })

    it('merging empty heap is no-op', () => {
      const heap1 = new FibonacciHeap<number>()
      heap1.insert(5, 5)
      const heap2 = new FibonacciHeap<number>()

      heap1.merge(heap2)
      expect(heap1.size).toBe(1)
    })
  })

  // ─── isEmpty ────────────────────────────────────────
  describe('isEmpty', () => {
    it('returns correct states', () => {
      const heap = new FibonacciHeap<number>()
      expect(heap.isEmpty()).toBe(true)
      heap.insert(1, 1)
      expect(heap.isEmpty()).toBe(false)
      heap.extractMin()
      expect(heap.isEmpty()).toBe(true)
    })
  })

  // ─── clear ──────────────────────────────────────────
  describe('clear', () => {
    it('empties the heap', () => {
      const heap = new FibonacciHeap<number>()
      heap.insert(1, 1)
      heap.insert(2, 2)
      heap.insert(3, 3)
      heap.clear()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
      expect(heap.min).toBeUndefined()
      expect(heap.extractMin()).toBeUndefined()
    })
  })

  // ─── consolidation ──────────────────────────────────
  describe('consolidation', () => {
    it('insert 20 items and extract all in correct order', () => {
      const heap = new FibonacciHeap<number>()
      for (let i = 20; i >= 1; i--) {
        heap.insert(i, i)
      }

      for (let i = 1; i <= 20; i++) {
        expectNode(heap.extractMin(), i, i)
      }
      expect(heap.isEmpty()).toBe(true)
    })
  })

  // ─── large heap ─────────────────────────────────────
  describe('large heap', () => {
    it('insert 500 items and extract all in order', () => {
      const heap = new FibonacciHeap<number>()
      const items = Array.from({ length: 500 }, (_, i) => i + 1)

      const shuffled = [...items]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }

      for (const item of shuffled) {
        heap.insert(item, item)
      }

      for (let i = 1; i <= 500; i++) {
        const result = heap.extractMin()!
        expect(result.key).toBe(i)
      }
      expect(heap.isEmpty()).toBe(true)
    })
  })
})
