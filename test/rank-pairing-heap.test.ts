import { describe, it, expect } from 'vitest'
import { RankPairingHeap } from '../src/core/rank-pairing-heap/index.js'

describe('RankPairingHeap', () => {
  // ─── Construction & Basic Ops ───
  describe('construction and basic operations', () => {
    it('creates empty heap', () => {
      const heap = new RankPairingHeap<number>()
      expect(heap.size).toBe(0)
      expect(heap.isEmpty).toBe(true)
    })

    it('insert adds element', () => {
      const heap = new RankPairingHeap<number>()
      heap.insert(5)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(5)
    })

    it('push is alias for insert', () => {
      const heap = new RankPairingHeap<number>()
      heap.push(3)
      expect(heap.peek()).toBe(3)
    })

    it('peek returns min', () => {
      const heap = new RankPairingHeap<number>()
      heap.insert(5)
      heap.insert(2)
      heap.insert(8)
      expect(heap.peek()).toBe(2)
    })

    it('peek throws on empty heap', () => {
      expect(() => new RankPairingHeap<number>().peek()).toThrow(Error)
    })

    it('pop returns and removes min', () => {
      const heap = new RankPairingHeap<number>()
      heap.insert(5)
      heap.insert(2)
      heap.insert(8)
      expect(heap.pop()).toBe(2)
      expect(heap.pop()).toBe(5)
      expect(heap.pop()).toBe(8)
      expect(heap.size).toBe(0)
    })

    it('pop throws on empty heap', () => {
      expect(() => new RankPairingHeap<number>().pop()).toThrow(Error)
    })
  })

  // ─── Bulk Operations ───
  describe('bulk operations', () => {
    it('fromArray creates heap', () => {
      const heap = RankPairingHeap.fromArray([5, 3, 1, 4])
      expect(heap.peek()).toBe(1)
      expect(heap.size).toBe(4)
    })

    it('toArray returns sorted elements', () => {
      const heap = RankPairingHeap.fromArray([5, 3, 1, 4, 2])
      expect(heap.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('merge combines two heaps', () => {
      const h1 = RankPairingHeap.fromArray([1, 5])
      const h2 = RankPairingHeap.fromArray([2, 3])
      h1.merge(h2)
      expect(h1.size).toBe(4)
      expect(h1.peek()).toBe(1)
      expect(h2.size).toBe(0)
    })

    it('merge with self is no-op', () => {
      const heap = RankPairingHeap.fromArray([1, 2])
      heap.merge(heap)
      expect(heap.size).toBe(2)
    })
  })

  // ─── Advanced Ops ───
  describe('advanced operations', () => {
    it('decreaseKey reduces value', () => {
      const heap = new RankPairingHeap<number>()
      const node = heap.insert(10)
      heap.insert(5)
      heap.decreaseKey(node, 1)
      expect(heap.peek()).toBe(1)
    })

    it('decreaseKey throws on increase', () => {
      const heap = new RankPairingHeap<number>()
      const node = heap.insert(5)
      expect(() => heap.decreaseKey(node, 10)).toThrow(Error)
    })

    it('delete removes node', () => {
      const heap = new RankPairingHeap<number>()
      const node = heap.insert(10)
      heap.insert(5)
      heap.delete(node)
      expect(heap.size).toBe(1)
      expect(heap.peek()).toBe(5)
    })

    it('contains checks node presence', () => {
      const heap = new RankPairingHeap<number>()
      const node = heap.insert(5)
      expect(heap.contains(node)).toBe(true)
    })

    it('isValid returns true for valid heap', () => {
      const heap = RankPairingHeap.fromArray([3, 1, 2])
      expect(heap.isValid()).toBe(true)
    })

    it('pushPop inserts and pops min', () => {
      const heap = RankPairingHeap.fromArray([5, 10])
      expect(heap.pushPop(3)).toBe(3)
      expect(heap.size).toBe(2)
    })

    it('pushPop on empty returns value', () => {
      const heap = new RankPairingHeap<number>()
      expect(heap.pushPop(5)).toBe(5)
    })

    it('replacePeek replaces min', () => {
      const heap = RankPairingHeap.fromArray([1, 5])
      expect(heap.replacePeek(3)).toBe(1)
    })
  })

  // ─── Iteration & Clone ───
  describe('iteration and clone', () => {
    it('clone produces independent copy', () => {
      const heap = RankPairingHeap.fromArray([1, 2, 3])
      const cloned = heap.clone()
      heap.pop()
      expect(cloned.size).toBe(3)
    })

    it('is iterable', () => {
      const heap = RankPairingHeap.fromArray([3, 1, 2])
      expect([...heap]).toEqual([1, 2, 3])
    })

    it('forEach iterates in order', () => {
      const heap = RankPairingHeap.fromArray([3, 1, 2])
      const vals: number[] = []
      heap.forEach((v) => vals.push(v))
      expect(vals).toEqual([1, 2, 3])
    })

    it('clear empties heap', () => {
      const heap = RankPairingHeap.fromArray([1, 2])
      heap.clear()
      expect(heap.size).toBe(0)
    })
  })

  // ─── Custom Comparator ───
  describe('custom comparator', () => {
    it('supports max heap via reverse comparator', () => {
      const heap = new RankPairingHeap<number>({ comparator: (a, b) => b - a })
      heap.insert(1)
      heap.insert(5)
      heap.insert(3)
      expect(heap.peek()).toBe(5)
    })
  })
})
