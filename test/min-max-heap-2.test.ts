import { MinMaxHeap } from '../src/core/min-max-heap-2/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('MinMaxHeap', () => {
  describe('constructor', () => {
    it('creates empty heap', () => {
      const heap = new MinMaxHeap<number>()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty()).toBe(true)
    })

    it('accepts custom comparator', () => {
      const heap = new MinMaxHeap<number>({ comparator: (a, b) => b - a })
      heap.push(1)
      heap.push(2)
      heap.push(3)
      expect(heap.peekMin()).toBe(3)
    })
  })

  // ─── Push ────────────────────────────────────────────────────────────────

  describe('push', () => {
    it('pushes elements', () => {
      const heap = new MinMaxHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      expect(heap.size).toBe(3)
    })
  })

  // ─── PeekMin / PeekMax ───────────────────────────────────────────────────

  describe('peekMin and peekMax', () => {
    it('peekMin returns smallest', () => {
      const heap = new MinMaxHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      expect(heap.peekMin()).toBe(3)
    })

    it('peekMax returns largest', () => {
      const heap = new MinMaxHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      expect(heap.peekMax()).toBe(7)
    })

    it('returns undefined for empty heap', () => {
      const heap = new MinMaxHeap<number>()
      expect(heap.peekMin()).toBe(undefined)
      expect(heap.peekMax()).toBe(undefined)
    })
  })

  // ─── PopMin / PopMax ─────────────────────────────────────────────────────

  describe('popMin and popMax', () => {
    it('popMin removes and returns smallest', () => {
      const heap = new MinMaxHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      expect(heap.popMin()).toBe(3)
      expect(heap.size).toBe(2)
    })

    it('popMax removes and returns largest', () => {
      const heap = new MinMaxHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      expect(heap.popMax()).toBe(7)
      expect(heap.size).toBe(2)
    })

    it('returns undefined for empty heap', () => {
      const heap = new MinMaxHeap<number>()
      expect(heap.popMin()).toBe(undefined)
      expect(heap.popMax()).toBe(undefined)
    })

    it('handles single element', () => {
      const heap = new MinMaxHeap<number>()
      heap.push(42)
      expect(heap.popMin()).toBe(42)
      expect(heap.isEmpty()).toBe(true)
    })
  })

  // ─── Contains / Remove ──────────────────────────────────────────────────

  describe('contains and remove', () => {
    it('contains checks membership', () => {
      const heap = new MinMaxHeap<number>()
      heap.push(5)
      expect(heap.contains(5)).toBe(true)
      expect(heap.contains(3)).toBe(false)
    })

    it('containsWith uses predicate', () => {
      const heap = new MinMaxHeap<number>()
      heap.push(5)
      heap.push(10)
      expect(heap.containsWith((v) => v > 7)).toBe(true)
      expect(heap.containsWith((v) => v > 20)).toBe(false)
    })

    it('remove deletes element', () => {
      const heap = new MinMaxHeap<number>()
      heap.push(5)
      heap.push(3)
      heap.push(7)
      expect(heap.remove(3)).toBe(true)
      expect(heap.contains(3)).toBe(false)
      expect(heap.remove(99)).toBe(false)
    })

    it('removeFirst removes by predicate', () => {
      const heap = new MinMaxHeap<number>()
      heap.push(5)
      heap.push(10)
      expect(heap.removeFirst((v) => v > 7)).toBe(true)
      expect(heap.size).toBe(1)
    })
  })

  // ─── Utility Methods ─────────────────────────────────────────────────────

  describe('utility methods', () => {
    it('clear empties heap', () => {
      const heap = new MinMaxHeap<number>()
      heap.push(1)
      heap.push(2)
      heap.clear()
      expect(heap.isEmpty()).toBe(true)
    })

    it('toArray returns copy', () => {
      const heap = new MinMaxHeap<number>()
      heap.push(5)
      heap.push(3)
      expect(heap.toArray().length).toBe(2)
    })

    it('stats returns heap info', () => {
      const heap = new MinMaxHeap<number>()
      expect(heap.stats()).toEqual({ size: 0, height: 0 })
      heap.push(1)
      expect(heap.stats().size).toBe(1)
      expect(heap.stats().height).toBe(1)
    })

    it('clone creates independent copy', () => {
      const heap = new MinMaxHeap<number>()
      heap.push(5)
      const cloned = heap.clone()
      cloned.push(10)
      expect(heap.size).toBe(1)
      expect(cloned.size).toBe(2)
    })

    it('merge combines two heaps', () => {
      const h1 = new MinMaxHeap<number>()
      h1.push(5)
      const h2 = new MinMaxHeap<number>()
      h2.push(3)
      h2.push(7)
      h1.merge(h2)
      expect(h1.size).toBe(3)
    })

    it('Symbol.iterator works', () => {
      const heap = new MinMaxHeap<number>()
      heap.push(1)
      heap.push(2)
      expect([...heap].length).toBe(2)
    })

    it('static from creates heap', () => {
      const heap = MinMaxHeap.from([5, 3, 7, 1])
      expect(heap.size).toBe(4)
      expect(heap.peekMin()).toBe(1)
      expect(heap.peekMax()).toBe(7)
    })
  })

  // ─── Comprehensive Sorting ───────────────────────────────────────────────

  describe('comprehensive sorting', () => {
    it('alternating popMin/popMax empties heap', () => {
      const heap = new MinMaxHeap<number>()
      const values = [5, 3, 7, 1, 9, 2, 8]
      for (const v of values) heap.push(v)
      expect(heap.popMin()).toBe(1)
      expect(heap.popMax()).toBe(9)
      expect(heap.popMin()).toBe(2)
      expect(heap.popMax()).toBe(8)
      expect(heap.popMin()).toBe(3)
      expect(heap.popMax()).toBe(7)
      expect(heap.popMin()).toBe(5)
      expect(heap.isEmpty()).toBe(true)
    })
  })
})
