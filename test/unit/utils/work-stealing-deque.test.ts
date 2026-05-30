import { describe, it, expect } from 'vitest'
import { WorkStealingDeque } from '../../../src/utils/work-stealing-deque.js'

describe('WorkStealingDeque', () => {
  describe('pushBottom and popBottom', () => {
    it('pushes and pops items', () => {
      const dq = new WorkStealingDeque<number>()
      dq.pushBottom(1)
      dq.pushBottom(2)
      dq.pushBottom(3)
      expect(dq.popBottom()).toBe(3)
      expect(dq.popBottom()).toBe(2)
      expect(dq.popBottom()).toBe(1)
    })

    it('returns undefined when empty', () => {
      const dq = new WorkStealingDeque<number>()
      expect(dq.popBottom()).toBeUndefined()
    })
  })

  describe('steal', () => {
    it('steals from the top', () => {
      const dq = new WorkStealingDeque<number>()
      dq.pushBottom(1)
      dq.pushBottom(2)
      dq.pushBottom(3)
      expect(dq.steal()).toBe(1)
      expect(dq.steal()).toBe(2)
    })

    it('returns undefined when empty', () => {
      const dq = new WorkStealingDeque<number>()
      expect(dq.steal()).toBeUndefined()
    })
  })

  describe('mixed operations', () => {
    it('handles push, steal, pop', () => {
      const dq = new WorkStealingDeque<number>()
      dq.pushBottom(1)
      dq.pushBottom(2)
      dq.pushBottom(3)
      expect(dq.steal()).toBe(1)
      expect(dq.popBottom()).toBe(3)
      expect(dq.steal()).toBe(2)
      expect(dq.isEmpty()).toBe(true)
    })

    it('handles interleaved operations', () => {
      const dq = new WorkStealingDeque<string>()
      dq.pushBottom('a')
      dq.pushBottom('b')
      expect(dq.steal()).toBe('a')
      dq.pushBottom('c')
      expect(dq.popBottom()).toBe('c')
      expect(dq.popBottom()).toBe('b')
    })
  })

  describe('size', () => {
    it('tracks size correctly', () => {
      const dq = new WorkStealingDeque<number>()
      expect(dq.size).toBe(0)
      dq.pushBottom(1)
      expect(dq.size).toBe(1)
      dq.pushBottom(2)
      expect(dq.size).toBe(2)
      dq.popBottom()
      expect(dq.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('returns true when empty', () => {
      const dq = new WorkStealingDeque<number>()
      expect(dq.isEmpty()).toBe(true)
    })

    it('returns false when items present', () => {
      const dq = new WorkStealingDeque<number>()
      dq.pushBottom(1)
      expect(dq.isEmpty()).toBe(false)
    })
  })

  describe('toArray', () => {
    it('returns current items', () => {
      const dq = new WorkStealingDeque<number>()
      dq.pushBottom(1)
      dq.pushBottom(2)
      dq.pushBottom(3)
      expect(dq.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('growth', () => {
    it('grows beyond initial capacity', () => {
      const dq = new WorkStealingDeque<number>(4)
      for (let i = 0; i < 100; i++) {
        dq.pushBottom(i)
      }
      expect(dq.size).toBe(100)
      expect(dq.steal()).toBe(0)
      expect(dq.popBottom()).toBe(99)
    })
  })
})
