import { describe, it, expect } from 'vitest'
import { DoubleBuffer } from '../../../src/utils/double-buffer.js'

describe('DoubleBuffer', () => {
  describe('push and swap', () => {
    it('pushes to back, swaps to front', () => {
      const db = new DoubleBuffer<number>()
      db.push(1)
      db.push(2)
      expect(db.pendingCount).toBe(2)
      expect(db.readyCount).toBe(0)

      const ready = db.swap()
      expect(ready).toEqual([1, 2])
      expect(db.frontBuffer).toEqual([1, 2])
      expect(db.backBuffer).toEqual([])
      expect(db.pendingCount).toBe(0)
    })

    it('multiple swaps accumulate correctly', () => {
      const db = new DoubleBuffer<string>()
      db.push('a')
      db.swap()
      db.push('b')
      const second = db.swap()
      expect(second).toEqual(['b'])
      expect(db.totalSwaps).toBe(2)
    })

    it('clears back after swap', () => {
      const db = new DoubleBuffer<number>()
      db.push(1)
      db.swap()
      db.push(2)
      db.push(3)
      expect(db.pendingCount).toBe(2)
      db.swap()
      expect(db.pendingCount).toBe(0)
    })
  })

  describe('pushMany', () => {
    it('pushes multiple items', () => {
      const db = new DoubleBuffer<number>()
      db.pushMany([1, 2, 3, 4, 5])
      expect(db.pendingCount).toBe(5)
      const ready = db.swap()
      expect(ready).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('isEmpty', () => {
    it('returns true when both empty', () => {
      const db = new DoubleBuffer<number>()
      expect(db.isEmpty).toBe(true)
    })

    it('returns false when back has items', () => {
      const db = new DoubleBuffer<number>()
      db.push(1)
      expect(db.isEmpty).toBe(false)
    })

    it('returns false when front has items', () => {
      const db = new DoubleBuffer<number>()
      db.push(1)
      db.swap()
      expect(db.isEmpty).toBe(false)
    })
  })

  describe('hasPending', () => {
    it('returns true when back has items', () => {
      const db = new DoubleBuffer<number>()
      db.push(1)
      expect(db.hasPending).toBe(true)
    })

    it('returns false when back empty', () => {
      const db = new DoubleBuffer<number>()
      expect(db.hasPending).toBe(false)
    })
  })

  describe('consumeFront', () => {
    it('iterates front buffer', () => {
      const db = new DoubleBuffer<number>()
      db.push(10)
      db.push(20)
      db.swap()
      const collected: number[] = []
      db.consumeFront((v) => collected.push(v))
      expect(collected).toEqual([10, 20])
    })
  })

  describe('consumeSwap', () => {
    it('swaps and consumes', () => {
      const db = new DoubleBuffer<number>()
      db.push(5)
      db.push(6)
      const collected: number[] = []
      db.consumeSwap((v) => collected.push(v))
      expect(collected).toEqual([5, 6])
      expect(db.pendingCount).toBe(0)
    })
  })

  describe('drainFront', () => {
    it('drains front buffer', () => {
      const db = new DoubleBuffer<number>()
      db.push(1)
      db.swap()
      const drained = db.drainFront()
      expect(drained).toEqual([1])
      expect(db.readyCount).toBe(0)
    })
  })

  describe('clear', () => {
    it('clears both buffers', () => {
      const db = new DoubleBuffer<number>()
      db.push(1)
      db.swap()
      db.push(2)
      db.clear()
      expect(db.isEmpty).toBe(true)
      expect(db.pendingCount).toBe(0)
      expect(db.readyCount).toBe(0)
    })
  })

  describe('totalSwaps', () => {
    it('tracks total swaps', () => {
      const db = new DoubleBuffer<number>()
      expect(db.totalSwaps).toBe(0)
      db.swap()
      db.swap()
      db.swap()
      expect(db.totalSwaps).toBe(3)
    })
  })

  describe('type safety', () => {
    it('works with objects', () => {
      const db = new DoubleBuffer<{ id: number }>()
      db.push({ id: 1 })
      db.push({ id: 2 })
      const ready = db.swap()
      expect(ready[0]!.id).toBe(1)
      expect(ready[1]!.id).toBe(2)
    })
  })
})
