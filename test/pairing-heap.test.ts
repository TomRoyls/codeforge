import { describe, it, expect } from 'vitest'
import { PairingHeap } from '../src/utils/pairing-heap.js'

describe('PairingHeap', () => {
  describe('constructor', () => {
    it('creates empty heap with default comparator', () => {
      const h = new PairingHeap<number>()
      expect(h.isEmpty()).toBe(true)
      expect(h.size).toBe(0)
    })

    it('accepts custom comparator', () => {
      const h = new PairingHeap<number>({ comparator: (a, b) => b - a })
      h.insert(1)
      h.insert(5)
      h.insert(3)
      expect(h.peek()).toBe(5)
    })
  })

  describe('insert and peek', () => {
    it('inserts and peeks minimum', () => {
      const h = new PairingHeap<number>()
      h.insert(5)
      h.insert(3)
      h.insert(7)
      expect(h.peek()).toBe(3)
    })

    it('inserts and peeks with findMin', () => {
      const h = new PairingHeap<number>()
      h.insert(10)
      expect(h.findMin()).toBe(10)
    })

    it('returns undefined for empty heap', () => {
      expect(new PairingHeap<number>().peek()).toBeUndefined()
    })
  })

  describe('extractMin', () => {
    it('extracts in ascending order', () => {
      const h = new PairingHeap<number>()
      h.insert(5)
      h.insert(3)
      h.insert(7)
      h.insert(1)
      h.insert(9)
      expect(h.extractMin()).toBe(1)
      expect(h.extractMin()).toBe(3)
      expect(h.extractMin()).toBe(5)
      expect(h.extractMin()).toBe(7)
      expect(h.extractMin()).toBe(9)
      expect(h.isEmpty()).toBe(true)
    })

    it('returns undefined for empty heap', () => {
      expect(new PairingHeap<number>().extractMin()).toBeUndefined()
    })

    it('handles duplicates', () => {
      const h = new PairingHeap<number>()
      h.insert(3)
      h.insert(3)
      h.insert(1)
      expect(h.extractMin()).toBe(1)
      expect(h.extractMin()).toBe(3)
      expect(h.extractMin()).toBe(3)
    })
  })

  describe('decreaseKey', () => {
    it('decreases key and restructures', () => {
      const h = new PairingHeap<number>()
      h.insert(10)
      const node = h.insert(5)
      h.insert(3)
      h.decreaseKey(node, 1)
      expect(h.peek()).toBe(1)
    })

    it('throws when increasing value', () => {
      const h = new PairingHeap<number>()
      const node = h.insert(5)
      expect(() => h.decreaseKey(node, 10)).toThrow()
    })
  })

  describe('delete', () => {
    it('deletes a non-root node', () => {
      const h = new PairingHeap<number>()
      h.insert(1)
      const node = h.insert(5)
      h.insert(3)
      h.delete(node)
      expect(h.size).toBe(2)
      expect(h.extractMin()).toBe(1)
      expect(h.extractMin()).toBe(3)
    })

    it('deletes root node via extractMin', () => {
      const h = new PairingHeap<number>()
      const node = h.insert(1)
      h.insert(5)
      h.delete(node)
      expect(h.peek()).toBe(5)
    })
  })

  describe('merge', () => {
    it('merges two heaps', () => {
      const h1 = new PairingHeap<number>()
      h1.insert(5)
      h1.insert(3)
      const h2 = new PairingHeap<number>()
      h2.insert(4)
      h2.insert(1)
      h1.merge(h2)
      expect(h1.size).toBe(4)
      expect(h2.isEmpty()).toBe(true)
      expect(h1.extractMin()).toBe(1)
    })

    it('merging empty heap is no-op', () => {
      const h = new PairingHeap<number>()
      h.insert(5)
      h.merge(new PairingHeap<number>())
      expect(h.size).toBe(1)
      expect(h.peek()).toBe(5)
    })
  })

  describe('clear', () => {
    it('clears the heap', () => {
      const h = new PairingHeap<number>()
      h.insert(1)
      h.insert(2)
      h.clear()
      expect(h.isEmpty()).toBe(true)
      expect(h.size).toBe(0)
    })
  })

  describe('size tracking', () => {
    it('tracks size through operations', () => {
      const h = new PairingHeap<number>()
      h.insert(1)
      h.insert(2)
      h.insert(3)
      expect(h.size).toBe(3)
      h.extractMin()
      expect(h.size).toBe(2)
    })
  })

  describe('large dataset', () => {
    it('sorts 100 elements correctly', () => {
      const h = new PairingHeap<number>()
      const values = Array.from({ length: 100 }, (_, i) => (i * 37) % 100)
      for (const v of values) h.insert(v)
      const sorted: number[] = []
      while (!h.isEmpty()) sorted.push(h.extractMin()!)
      expect(sorted).toEqual([...values].sort((a, b) => a - b))
    })
  })
})
