import { PairingHeap3 } from '../src/core/pairing-heap-3/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('PairingHeap3', () => {
  describe('constructor', () => {
    it('creates empty heap', () => {
      const heap = new PairingHeap3<number>()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('accepts custom comparator', () => {
      const heap = new PairingHeap3<number>({ comparator: (a, b) => b - a })
      heap.insert(1)
      heap.insert(2)
      heap.insert(3)
      expect(heap.peek()).toBe(3)
    })
  })

  // ─── Insert ──────────────────────────────────────────────────────────────

  describe('insert', () => {
    it('inserts a single element', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(10)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(10)
    })

    it('inserts multiple maintaining min-heap', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(30)
      heap.insert(10)
      heap.insert(20)
      expect(heap.peek()).toBe(10)
    })

    it('returns a node reference', () => {
      const heap = new PairingHeap3<number>()
      const node = heap.insert(42)
      expect(node.value).toBe(42)
    })
  })

  // ─── ExtractMin ──────────────────────────────────────────────────────────

  describe('extractMin', () => {
    it('extracts minimum element', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(30)
      heap.insert(10)
      heap.insert(20)
      expect(heap.extractMin()).toBe(10)
      expect(heap.extractMin()).toBe(20)
      expect(heap.extractMin()).toBe(30)
    })

    it('throws on empty heap', () => {
      const heap = new PairingHeap3<number>()
      expect(() => heap.extractMin()).toThrow('empty')
    })

    it('handles single element', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(42)
      expect(heap.extractMin()).toBe(42)
      expect(heap.isEmpty).toBe(true)
    })
  })

  // ─── Peek ────────────────────────────────────────────────────────────────

  describe('peek', () => {
    it('returns minimum without removing', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(5)
      heap.insert(3)
      expect(heap.peek()).toBe(3)
      expect(heap.size).toBe(2)
    })

    it('throws on empty heap', () => {
      const heap = new PairingHeap3<number>()
      expect(() => heap.peek()).toThrow('empty')
    })
  })

  // ─── Merge ───────────────────────────────────────────────────────────────

  describe('merge', () => {
    it('merges two heaps', () => {
      const h1 = new PairingHeap3<number>()
      h1.insert(10)
      h1.insert(30)
      const h2 = new PairingHeap3<number>()
      h2.insert(5)
      h2.insert(20)
      h1.merge(h2)
      expect(h1.size).toBe(4)
      expect(h1.peek()).toBe(5)
      expect(h2.isEmpty).toBe(true)
    })

    it('merge with self is no-op', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(1)
      heap.merge(heap)
      expect(heap.size).toBe(1)
    })
  })

  // ─── DecreaseKey ─────────────────────────────────────────────────────────

  describe('decreaseKey', () => {
    it('decreases key and restructures', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(20)
      const node = heap.insert(30)
      heap.decreaseKey(node, 5)
      expect(heap.peek()).toBe(5)
    })

    it('throws if new value is greater', () => {
      const heap = new PairingHeap3<number>()
      const node = heap.insert(5)
      expect(() => heap.decreaseKey(node, 10)).toThrow('greater')
    })

    it('throws on empty heap', () => {
      const heap = new PairingHeap3<number>()
      const node = { value: 1, child: null, sibling: null }
      expect(() => heap.decreaseKey(node, 0)).toThrow('empty')
    })
  })

  // ─── Delete ──────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes a specific node', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(10)
      const node = heap.insert(20)
      heap.insert(30)
      heap.delete(node)
      expect(heap.size).toBe(2)
    })

    it('deletes root via extractMin', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(10)
      const node = heap.insert(20)
      heap.delete(node)
      expect(heap.peek()).toBe(10)
    })
  })

  // ─── Update ──────────────────────────────────────────────────────────────

  describe('update', () => {
    it('update decreases key', () => {
      const heap = new PairingHeap3<number>()
      const node = heap.insert(20)
      heap.update(node, 5)
      expect(heap.peek()).toBe(5)
    })

    it('update increases key (delete + reinsert)', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(10)
      const node = heap.insert(5)
      heap.update(node, 50)
      expect(heap.peek()).toBe(10)
    })
  })

  // ─── Contains ────────────────────────────────────────────────────────────

  describe('contains', () => {
    it('finds existing value', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(42)
      expect(heap.contains(42)).toBe(true)
      expect(heap.contains(99)).toBe(false)
    })

    it('returns false for empty heap', () => {
      const heap = new PairingHeap3<number>()
      expect(heap.contains(1)).toBe(false)
    })
  })

  // ─── Utility Methods ─────────────────────────────────────────────────────

  describe('utility methods', () => {
    it('clear empties heap', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(1)
      heap.insert(2)
      heap.clear()
      expect(heap.isEmpty).toBe(true)
      expect(heap.size).toBe(0)
    })

    it('toArray returns all elements', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(10)
      heap.insert(20)
      expect(heap.toArray().length).toBe(2)
      expect(heap.toArray()).toContain(10)
    })

    it('toSortedArray returns sorted', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(30)
      heap.insert(10)
      heap.insert(20)
      expect(heap.toSortedArray()).toEqual([10, 20, 30])
    })

    it('clone creates independent copy', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(5)
      const cloned = heap.clone()
      cloned.insert(10)
      expect(heap.size).toBe(1)
      expect(cloned.size).toBe(2)
    })

    it('forEach iterates all elements', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(10)
      heap.insert(20)
      const collected: number[] = []
      heap.forEach((v) => collected.push(v))
      expect(collected.length).toBe(2)
    })

    it('Symbol.iterator works', () => {
      const heap = new PairingHeap3<number>()
      heap.insert(10)
      heap.insert(20)
      expect([...heap].length).toBe(2)
    })
  })

  // ─── Static Methods ──────────────────────────────────────────────────────

  describe('static methods', () => {
    it('fromArray creates heap', () => {
      const heap = PairingHeap3.fromArray([30, 10, 20])
      expect(heap.peek()).toBe(10)
      expect(heap.size).toBe(3)
    })

    it('static merge creates new merged heap', () => {
      const a = PairingHeap3.fromArray([10, 30])
      const b = PairingHeap3.fromArray([5, 20])
      const merged = PairingHeap3.merge(a, b)
      expect(merged.peek()).toBe(5)
      expect(merged.size).toBe(4)
      expect(a.size).toBe(2)
    })
  })
})
