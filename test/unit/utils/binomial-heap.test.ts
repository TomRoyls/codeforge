import { describe, it, expect } from 'vitest'
import { BinomialHeap } from '../../../src/utils/binomial-heap.js'

describe('BinomialHeap', () => {
  describe('insert and peek', () => {
    it('inserts a single element', () => {
      const h = new BinomialHeap<string>()
      h.insert('a', 1)
      expect(h.size).toBe(1)
      expect(h.peek()?.value).toBe('a')
    })

    it('maintains min on inserts', () => {
      const h = new BinomialHeap<string>()
      h.insert('c', 3)
      h.insert('a', 1)
      h.insert('b', 2)
      expect(h.peek()?.value).toBe('a')
    })

    it('handles duplicate priorities', () => {
      const h = new BinomialHeap<number>()
      h.insert(1, 5)
      h.insert(2, 5)
      h.insert(3, 5)
      expect(h.size).toBe(3)
    })
  })

  describe('extractMin', () => {
    it('extracts elements in order', () => {
      const h = new BinomialHeap<number>()
      h.insert(3, 3)
      h.insert(1, 1)
      h.insert(2, 2)
      expect(h.extractMin()?.value).toBe(1)
      expect(h.extractMin()?.value).toBe(2)
      expect(h.extractMin()?.value).toBe(3)
      expect(h.extractMin()).toBeUndefined()
    })

    it('handles empty heap', () => {
      const h = new BinomialHeap<number>()
      expect(h.extractMin()).toBeUndefined()
    })

    it('handles single element', () => {
      const h = new BinomialHeap<number>()
      h.insert(42, 1)
      expect(h.extractMin()?.value).toBe(42)
      expect(h.size).toBe(0)
    })
  })

  describe('merge', () => {
    it('merges two heaps', () => {
      const h1 = new BinomialHeap<number>()
      h1.insert(5, 5)
      h1.insert(3, 3)
      const h2 = new BinomialHeap<number>()
      h2.insert(1, 1)
      h2.insert(4, 4)
      h1.merge(h2)
      expect(h1.size).toBe(4)
      expect(h1.extractMin()?.value).toBe(1)
      expect(h2.size).toBe(0)
    })

    it('merges empty heap', () => {
      const h1 = new BinomialHeap<number>()
      h1.insert(1, 1)
      const h2 = new BinomialHeap<number>()
      h1.merge(h2)
      expect(h1.size).toBe(1)
    })
  })

  describe('stress test', () => {
    it('handles many insertions', () => {
      const h = new BinomialHeap<number>()
      const n = 100
      for (let i = n; i >= 1; i--) {
        h.insert(i, i)
      }
      for (let i = 1; i <= n; i++) {
        expect(h.extractMin()?.value).toBe(i)
      }
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty heap', () => {
      const h = new BinomialHeap<number>()
      expect(h.isEmpty()).toBe(true)
    })

    it('returns false after insert', () => {
      const h = new BinomialHeap<number>()
      h.insert(1, 1)
      expect(h.isEmpty()).toBe(false)
    })

    it('returns true after all extracted', () => {
      const h = new BinomialHeap<number>()
      h.insert(1, 1)
      h.extractMin()
      expect(h.isEmpty()).toBe(true)
    })
  })
})
